//////////////////////////////////////////////////////////////////
//
//   A shading example using Gouraud Shading  
//
//   Han-Wei Shen (shen.94@osu.edu)
//

var gl;
var shaderProgram;
var shaderProgramPhong;
var shaderProgramToon;
var shaderMode = 0;
var draw_type=2;

// set up the parameters for lighting 
var light_ambient = [0.1, 0.1, 0.1]; 
var light_diffuse = [.8, .8, .8];
var light_specular = [1, 1, 1]; 
var light_pos_in_world = [0, 0, 1];   // world space position

var mat_ambient = [0.7, 0.7, 0.7, 1]; 
var mat_diffuse= [1, 1, 0, 1]; 
var mat_specular = [.9, .9, .9, 1]; 
var mat_shine = [50]; 

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;

var tetrahedronVertexPositionBuffer;
var tetrahedronVertexNormalBuffer;

var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexIndexBuffer;

var lightVertexPositionBuffer;
var lightVertexNormalBuffer;
var lightVertexIndexBuffer;

var cylinderVertexPositionBuffer;
var cylinderVertexNormalBuffer;
var cylinderVertexIndexBuffer;

var coneVertexPositionBuffer;
var coneVertexNormalBuffer;


////////////////    Initialize VBO  ////////////////////////

var cyverts = [];
var cynormals = []; 
var cycolors = []; 
var cyindicies = [];

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////

    var mMatrix = mat4.create();  // model matrix
    var vMatrix = mat4.create(); // view matrix
    var mvMatrix = mat4.create(); // view matrix
    var pMatrix = mat4.create();  //projection matrix
    var nMatrix = mat4.create();  // normal matrix
    var Z_angle = 60.0;

    function setMatrixUniforms(mvMatrix, nMatrix, diffuse_color=mat_diffuse) {
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix); 
        gl.uniform3f(shaderProgram.diffuse_coefUniform, diffuse_color[0], diffuse_color[1], diffuse_color[2]); 	
	
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }


    ///////////////////////////////////////////////////////////////

     var lastMouseX = 0, lastMouseY = 0;

    ///////////////////////////////////////////////////////////////

     function onDocumentMouseDown( event ) {
          event.preventDefault();
          document.addEventListener( 'mousemove', onDocumentMouseMove, false );
          document.addEventListener( 'mouseup', onDocumentMouseUp, false );
          document.addEventListener( 'mouseout', onDocumentMouseOut, false );
          var mouseX = event.clientX;
          var mouseY = event.clientY;

          lastMouseX = mouseX;
          lastMouseY = mouseY; 

      }

     function onDocumentMouseMove( event ) {
          var mouseX = event.clientX;
          var mouseY = event.ClientY; 

          var diffX = mouseX - lastMouseX;
          var diffY = mouseY - lastMouseY;

          Z_angle = Z_angle + diffX/5;

          lastMouseX = mouseX;
          lastMouseY = mouseY;

          drawScene();
     }

     function onDocumentMouseUp( event ) {
          document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
          document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }

     function onDocumentMouseOut( event ) {
          document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
          document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
          document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
     }

     function onKeyDown(event) {
        var key = event.key;
        switch(key)  {
            case 'A': case 'a':
                mode = 2;
                break;
            case 'S': case 's':
                mode = 4;
                break;
            case 'D': case 'd':
                mode = 3;
                break;
            case 'W': case 'w':
                mode = 0;
                break;
            case 'L': case 'l':
                console.log('enter L/l');
                light_pos_in_world[0] += 0.1;
                break;
            case 'J': case 'j':
                console.log('enter J/j');
                light_pos_in_world[0] -= 0.1;
                break;
            case 'I': case 'i':
                console.log('enter I/i');
                light_pos_in_world[1] += 0.1;
                break;
            case 'K': case 'k':
                console.log('enter K/k');
                light_pos_in_world[1] -= 0.1;
                break;
            case 'M': case 'm':
                console.log('enter M/m');
                light_pos_in_world[2] += 0.1;
                break;
            case 'N': case 'n':
                console.log('enter N/n');
                light_pos_in_world[2] -= 0.1;
                break;
            case 'Q': case 'q':
                console.log('enter Q/q');
                switchShader();
                break;
      }
      console.log('light_pos_in_world: ', light_pos_in_world);
      drawScene();
    }

    ///////////////////////////////////////////////////////////////

    function webGLStart() {
        var canvas = document.getElementById("code03-canvas");
        initGL(canvas);
        initShaders();

	    gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.lightMode = gl.getUniformLocation(shaderProgram, "mode");
	
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

        initBuffers();


        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        console.log('start! ');

        document.addEventListener('mousedown', onDocumentMouseDown, false); 
        document.addEventListener('keydown', onKeyDown, false);
        drawScene();
    }

function BG(red, green, blue) {
    gl.clearColor(red, green, blue, 1.0);
    drawScene();
} 

function redraw() {
    Z_angle = 0; 
    drawScene();
}
    

function geometry(type) {
    draw_type = type;
    drawScene();
} 

//////////////////////////////////////////////////////////////
function pushMatrix(stack, m) {
    var copy = mat4.create(m);  //necessary because javascript only does shallow push 
    stack.push(copy); 
}

function popMatrix(stack) {
    return(stack.pop()); 
}