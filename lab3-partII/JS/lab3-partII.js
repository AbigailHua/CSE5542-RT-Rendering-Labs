//////////////////////////////////////////////////////////////////
//
//  An example to show you how to set up to draw a 3D cube
//  This is the first example you will need to set up a camera, and the model, view, and projection matrices 
//
//  Han-Wei Shen (shen.94@osu.edu)
//

var gl;
var shaderProgram;
var draw_type=2;
var scale = 1;
var translation = [0, 0, 0];

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
    // var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;

    var tetrahedronVertexPositionBuffer;
    // var tetrahedronVertexColorBuffer;
    var tetrahedronVertexIndexBuffer;

    var cylinderVertexPositionBuffer;
    // var cylinderVertexColorBuffer;
    var cylinderVertexIndexBuffer;

    var coneVertexPositionBuffer;
    // var coneVertexColorBuffer;
    var coneVertexIndexBuffer;

    var sphereVertexPositionBuffer;
    // var sphereVertexColorBuffer;
    var sphereVertexIndexBuffer;

    var AxesVertexPositionBuffer;

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////

    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create();  // model matrix
    var mvMatrix = mat4.create();  // modelview matrix
    var pMatrix = mat4.create();  //projection matrix 
    var Z_angle = 0.0;

    function setMatrixUniforms(mvMatrix, color) {
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniform4fv(shaderProgram.uColor, color); 
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

    function draw_Axes(mvMatrix){

        var offset = 0; 
        var stride = 0; 

        gl.bindBuffer(gl.ARRAY_BUFFER, AxesVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, AxesVertexPositionBuffer.vertexSize, gl.FLOAT, false, stride, offset);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var color = [0.0, 1.0, 1.0, 1.0]; 
        gl.uniform4fv(shaderProgram.uColor, color); 
        gl.drawArrays(gl.LINES, 0, 2);	// y axis 
        
        var color = [1.0, 0.0, 1.0, 1.0]; 
        gl.uniform4fv(shaderProgram.uColor, color); 
        gl.drawArrays(gl.LINES, 2, 2);	// y axis 

        var color = [1.0, 1.0, 0.0, 1.0]; 
        gl.uniform4fv(shaderProgram.uColor, color); 
        gl.drawArrays(gl.LINES, 4, 2);	// z axis 
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
            case 'Q':
                console.log('enter Q');
                degreeDict['leftArm'] += 10;
                break;
            case 'q':
                console.log('enter q');
                degreeDict['leftArm'] -= 10;
                break;
            case '}':
                console.log('enter }');
                degreeDict['rightArm'] += 10;
                break;
            case ']':
                console.log('enter ]');
                degreeDict['rightArm'] -= 10;
                break;
            case 'W':
                console.log('enter W');
                degreeDict['leftForearm'] += 10;
                break;
            case 'w':
                console.log('enter w');
                degreeDict['leftForearm'] -= 10;
                break;
            case '{':
                console.log('enter {');
                degreeDict['rightForearm'] += 10;
                break;
            case '[':
                console.log('enter [');
                degreeDict['rightForearm'] -= 10;
                break;
            case 'A':
                console.log('enter A');
                degreeDict['leftThigh'] += 10;
                break;
            case 'a':
                console.log('enter a');
                degreeDict['leftThigh'] -= 10;
                break;
            case '"':
                console.log('enter "');
                degreeDict['rightThigh'] += 10;
                break;
            case '\'':
                console.log('enter \'');
                degreeDict['rightThigh'] -= 10;
                break;
            case 'S':
                console.log('enter S');
                degreeDict['leftCalf'] += 10;
                break;
            case 's':
                console.log('enter s');
                degreeDict['leftCalf'] -= 10;
                break;
            case 'D':
                console.log('enter D');
                degreeDict['leftFoot'] += 10;
                break;
            case 'd':
                console.log('enter d');
                degreeDict['leftFoot'] -= 10;
                break;
            case ':':
                console.log('enter :');
                degreeDict['rightCalf'] += 10;
                break;
            case ';':
                console.log('enter ;');
                degreeDict['rightCalf'] -= 10;
                break;
            case 'L':
                console.log('enter L');
                degreeDict['rightFoot'] += 10;
                break;
            case 'l':
                console.log('enter l');
                degreeDict['rightFoot'] -= 10;
                break;
            case 'Z':
                console.log('enter Z');
                degreeDict['neck'] += 10;
                break;
            case 'z':
                console.log('enter z');
                degreeDict['neck'] -= 10;
                break;
            case 'X':
                console.log('enter X');
                degreeDict['head'] += 10;
                break;
            case 'x':
                console.log('enter x');
                degreeDict['head'] -= 10;
                break;
            case '~': case '`':
                console.log('enter ~/`');
                drawAxis = !drawAxis;
                break;
            case '!':
                console.log('enter !');
                degreeDict['hair11'] += 10;
                break;
            case '1':
                console.log('enter 1');
                degreeDict['hair11'] -= 10;
                break;
            case '@':
                console.log('enter @');
                degreeDict['hair21'] += 10;
                break;
            case '2':
                console.log('enter 2');
                degreeDict['hair21'] -= 10;
                break;
            case '#':
                console.log('enter #');
                degreeDict['hair31'] += 10;
                break;
            case '3':
                console.log('enter 3');
                degreeDict['hair31'] -= 10;
                break;
            case '$':
                console.log('enter $');
                degreeDict['hair41'] += 10;
                break;
            case '4':
                console.log('enter 4');
                degreeDict['hair41'] -= 10;
                break;
            case '%':
                console.log('enter %');
                degreeDict['hat'] += 10;
                break;
            case '5':
                console.log('enter 5');
                degreeDict['hat'] -= 10;
                break;
            case 'R':
                console.log('enter R');
                Z_angle += 10;
                break;
            case 'r':
                console.log('enter r');
                Z_angle -= 10;
                break;
            case 'T':
                console.log('enter T');
                degreeDict['badget'] += 10;
                break;
            case 't':
                console.log('enter t');
                degreeDict['badget'] -= 10;
                break; 
            case 'E': 
                console.log('enter E');
                scale *= 1.05;
                break;
            case 'e':
                console.log('enter e');
                scale *= 0.95;
                break;
            case 'H': case 'h':
                console.log('enter H/h');
                translation[0] += 0.1;
                break;
            case 'G': case 'g':
                console.log('enter G/g');
                translation[0] -= 0.1;
                break;
            case 'Y': case 'y':
                console.log('enter Y/y');
                translation[1] += 0.1;
                break;
            case 'B': case 'b':
                console.log('enter B/b');
                translation[1] -= 0.1;
                break;
            case 'V': case 'v':
                console.log('enter V/v');
                translation[2] += 0.1;
                break;
            case 'N': case 'n':
                console.log('enter N/n');
                translation[2] -= 0.1;
                break;
            case '|': case '\\':
                console.log('enter \\/|');
                draw_type = (draw_type+1) % 3;
                break;
            case '<': case ',':
                console.log('enter </,');
                cameraPos[0] -= 0.1;
                cameraCenter[0] -= 0.1;
                break;
            case '>': case '.':
                console.log('enter >/.');
                cameraPos[0] += 0.1;
                cameraCenter[0] += 0.1;
                break;
            case 'J': case 'j':
                console.log('enter J/j');
                cameraPos[1] -= 0.1;
                cameraCenter[1] -= 0.1;
                break;
            case 'K': case 'k':
                console.log('enter K/k');
                cameraPos[1] += 0.1;
                cameraCenter[1] += 0.1;
                break;
            case '?': case '/':
                console.log('enter ?//');
                cameraPos[2] -= 0.1;
                cameraCenter[2] -= 0.1;
                break;
            case 'M': case 'm':
                console.log('enter M/m');
                cameraPos[2] += 0.1;
                cameraCenter[2] += 0.1;
                break;
            case 'P':
                console.log('enter P');
                cameraViewUp[0] += 0.1;
                console.log('yyyyy', cameraViewUp);
                break;
            case 'p': 
                console.log('enter p');
                cameraViewUp[0] -= 0.1;
                console.log('yyyyy', cameraViewUp);
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
        // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");	
        shaderProgram.uColor = gl.getUniformLocation(shaderProgram, "uColor");
        initBuffers(); 

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

       document.addEventListener('mousedown', onDocumentMouseDown,
       false);
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