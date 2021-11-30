//////////////////////////////////////////////////////////////////
//
//   A shading example using Gouraud Shading  
//
//   Han-Wei Shen (shen.94@osu.edu)
//

var gl;
var shaderProgram;
var shaderMode = 0;
var draw_type=2;

// set up the parameters for lighting 
var light_ambient = [0.1, 0.1, 0.1]; 
var light_diffuse = [.8, .8, .8];
var light_specular = [1, 1, 1]; 
var light_pos_in_world = [2, 0, 1];   // world space position

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
    glTextureDict = [
        gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3,
        gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7,
        gl.TEXTURE8, gl.TEXTURE9, gl.TEXTURE10, gl.TEXTURE11,
        gl.TEXTURE12, gl.TEXTURE13, gl.TEXTURE14, gl.TEXTURE15,
        gl.TEXTURE16, gl.TEXTURE17, gl.TEXTURE18, gl.TEXTURE19,
        gl.TEXTURE20, gl.TEXTURE21, gl.TEXTURE22, gl.TEXTURE23,
        gl.TEXTURE24, gl.TEXTURE25, gl.TEXTURE26, gl.TEXTURE27,
        gl.TEXTURE28, gl.TEXTURE29, gl.TEXTURE30, gl.TEXTURE31,
    ];
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeVertexTexCoordsBuffer;

var lightVertexPositionBuffer;
var lightVertexNormalBuffer;
var lightVertexIndexBuffer;

var vaseVertexPositionBuffer;
var vaseVertexNormalBuffer;
var vaseVertexTexCoordsBuffer;

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
    var v2wMatrix = mat4.create();
    var Z_angle = {global: 0.0, firstPerson: 0.0};

    function setMatrixUniforms(mvMatrix, diffuse_color=color_white) {
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, getNMatrix(mvMatrix)); 
        gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);
        gl.uniform3f(shaderProgram.diffuse_coefUniform, diffuse_color[0], diffuse_color[1], diffuse_color[2]); 	
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
          
          if (isFirstPerson)
            Z_angle.firstPerson += diffX/5;
          else
            Z_angle.global += diffX/5;

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
            case 'A':
                if (!isFirstPerson) {
                    cameraPos[0] += 0.1;
                    cameraCenter[0] += 0.1;
                } else {
                    firstPersonPos[0] += 0.1;
                    firstPersonCenter[0] += 0.1;
                }
                break;
            case 'a':
                if (!isFirstPerson) {
                    cameraPos[0] -= 0.1;
                    cameraCenter[0] -= 0.1;
                } else {
                    firstPersonPos[0] -= 0.1;
                    firstPersonCenter[0] -= 0.1;
                }
                break;
            case 'S':
                if (!isFirstPerson) {
                    cameraPos[1] += 0.1;
                    cameraCenter[1] += 0.1;
                } else {
                    firstPersonPos[1] += 0.1;
                    firstPersonCenter[1] += 0.1;
                }
                break;
            case 's':
                if (!isFirstPerson) {
                    cameraPos[1] -= 0.1;
                    cameraCenter[1] -= 0.1;
                } else {
                    firstPersonPos[1] -= 0.1;
                    firstPersonCenter[1] -= 0.1;
                }
                break;
            case 'D':
                if (!isFirstPerson) {
                    cameraPos[2] += 0.1;
                    cameraCenter[2] += 0.1;
                } else {
                    firstPersonPos[2] += 0.1;
                    firstPersonCenter[2] += 0.1;
                }
                break;
            case 'd':
                if (!isFirstPerson) {
                    cameraPos[2] -= 0.1;
                    cameraCenter[2] -= 0.1;
                } else {
                    firstPersonPos[2] -= 0.1;
                    firstPersonCenter[2] -= 0.1;
                }
                break;
            case 'd':
                cameraPos[2] -= 0.1;
                cameraCenter[2] -= 0.1;
                break;
            case 'F': case 'f':
                isFirstPerson = !isFirstPerson;
                console.log(isFirstPerson);
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
      }
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

        shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
        gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);

        shaderProgram.lightMode = gl.getUniformLocation(shaderProgram, "mode");
	
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

        shaderProgram.textureKaUniform = gl.getUniformLocation(shaderProgram, "textureKa");
        shaderProgram.textureKdUniform = gl.getUniformLocation(shaderProgram, "textureKd");
        shaderProgram.textureKsUniform = gl.getUniformLocation(shaderProgram, "textureKs");

        shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");
        
        initBuffers();
        textureSet.wall = initTextures(texturePath.wall);
        textureSet.cement = initTextures(texturePath.cement);
        textureSet.blue = initTextures(texturePath.blue);
        textureSet.floor = initTextures(texturePath.floor);
        textureSet.wood = initTextures(texturePath.wood);
        initOBJLoader(objPath.bookObj, objPath.bookMtl);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        console.log('start! ');

        document.addEventListener('mousedown', onDocumentMouseDown, false); 
        document.addEventListener('keydown', onKeyDown, false);
        // drawScene();
    
        delay(10).then(() => drawScene());
    }

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function BG(red, green, blue) {
    gl.clearColor(red, green, blue, 1.0);
    drawScene();
} 

function redraw() {
    Z_angle = {global: 0, firstPerson: 0}; 
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