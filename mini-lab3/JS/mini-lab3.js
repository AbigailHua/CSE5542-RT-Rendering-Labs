
////////////////////////////////////////////////////////
//
//  Simple transformation of 2D triangles 
//  Notice TRIANGLE_FAN is used to draw 
// 
//  Han-Wei Shen (shen.94@osu.edu)
//
var gl;
var shaderProgram;
var draw_type=2;

var degreeDict = {
    'leftArm': 120, 'leftForearm': 0,
    'rightArm': 60, 'rightForearm': 0,
    'leftThigh': 90, 'leftCalf': 0, 'leftFoot': 0,
    'rightThigh': 90, 'rightCalf': 0, 'rightFoot': 0,
    'neck': 0, 'head': 0,
    'hair11': 105, 'hair12': 0,
    'hair21': 120, 'hair22': 0,
    'hair31': 75, 'hair32': 0,
    'hair41': 60, 'hair42': 0,
};

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

    var squareVertexPositionBuffer;
    var AxesVertexPositionBuffer; 

   ////////////////    Initialize VBO  ////////////////////////

    function initSquareBuffers() {

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var vertices = [
            0.5,  0.5,  0.0,
		    -0.5,  0.5,  0.0, 
            -0.5, -0.5,  0.0,
	        0.5, -0.5,  0.0,

        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.vertexSize = 3;
        squareVertexPositionBuffer.numVertices = 4;
    }

    function initAxesBuffers() {

        AxesVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, AxesVertexPositionBuffer);
        var vertices = [
            0.0,  0.0,  0.0,
		    0.0,  1.0,  0.0, 
            0.0,  0.0,  0.0,
	        1.0,  0.0,  0.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        AxesVertexPositionBuffer.vertexSize = 3;
        AxesVertexPositionBuffer.numVertices = 4;
    }



    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////


    var mvMatrix = mat4.create();

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

     //////////////////////////////////////////////////////////////
     function drawbox(mMatrix, color, drawaxis){

        var offset = 0; 
        var stride = 0; 

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.vertexSize, gl.FLOAT, false, stride, offset);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mMatrix);
        gl.uniform4fv(shaderProgram.uColor, color); 

        if (draw_type==2) gl.drawArrays(gl.TRIANGLE_FAN, 0, squareVertexPositionBuffer.numVertices);
	    else if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, squareVertexPositionBuffer.numVertices);	
        else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, squareVertexPositionBuffer.numVertices);

        if (drawaxis) draw_Axes(mMatrix); 

     }

     function draw_Axes(mvMatrix){

        var offset = 0; 
        var stride = 0; 

        gl.bindBuffer(gl.ARRAY_BUFFER, AxesVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.vertexSize, gl.FLOAT, false, stride, offset);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var color = [0,0,1.0, 1.0]; 
        gl.uniform4fv(shaderProgram.uColor, color); 
        gl.drawArrays(gl.LINES, 0, 2);	// y axis 
        
        var color = [1,0,0.0, 1.0]; 
        gl.uniform4fv(shaderProgram.uColor, color); 
        gl.drawArrays(gl.LINES, 2, 2);	// y axis 
     }


     //////////////////////////////////////////////////////////////
     function pushMatrix(stack, m) {
      var copy = mat4.create(m);  //necessary because javascript only does shallow push 
      stack.push(copy); 
     }

     function popMatrix(stack) {
         return(stack.pop()); 
     }
    
     ///////////////////////////////////////////////////////////////

    function drawScene() {

        var matrixStack = []; 

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var color = [1.0, 1.0, 1.0, 1.0]; 
      
        var model = mat4.create(); 
        mat4.identity(model); 
        
         // now draw a little box 
        model = mat4.multiply(model, mvMatrix);    
        pushMatrix(matrixStack, model);  
        pushMatrix(matrixStack, model);
        pushMatrix(matrixStack, model);
        pushMatrix(matrixStack, model);
        pushMatrix(matrixStack, model);
        model = mat4.translate(model, [0, -1.15, 0]);
        model =  mat4.scale(model, [2,3,1]); 
        color = [1.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack); 

        ///////////////////////////////////////////////
        // draw the right arm
        model = mat4.translate(model, [1,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['rightArm']), [0,0,-1]); 
        model = mat4.translate(model, [.75,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [0.0, 0.0, 1.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack); 

        // right forearm
        model = mat4.translate(model, [.8,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['rightForearm']), [0,0,-1]); 
        model = mat4.translate(model, [.7,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [1.0, 0.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack); 

        model = popMatrix(matrixStack); 
        ///////////////////////////////////////////////
        // draw the left arm
        model = mat4.translate(model, [-1,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['leftArm']), [0,0,-1]); 
        model = mat4.translate(model, [.75,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [0.0, 0.0, 1.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack); 

        // left forearm
        model = mat4.translate(model, [.8,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['leftForearm']), [0,0,-1]); 
        model = mat4.translate(model, [.7,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [1.0, 0.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        model = popMatrix(matrixStack); 

        ///////////////////////////////////////////////
        // draw the left thigh 
        model = mat4.translate(model, [-1,-2.3,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['leftThigh']), [0,0,-1]); 
        model = mat4.translate(model, [.75,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [0.0, 0.0, 1.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack); 

        // left calf
        model = mat4.translate(model, [.8,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['leftCalf']), [0,0,-1]); 
        model = mat4.translate(model, [.7,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [1.0, 0.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        // left foot
        model = mat4.translate(model, [.5,-0.07,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['leftFoot']), [0,0,-1]); 
        model = mat4.translate(model, [.5,-0.07,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [.5, 1, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        model = popMatrix(matrixStack); 

        ///////////////////////////////////////////////////////////
        // draw the right thigh
        model = mat4.translate(model, [1,-2.3,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['rightThigh']), [0,0,-1]); 
        model = mat4.translate(model, [.75,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [0.0, 0.0, 1.0, 1.0]; 
        drawbox(model, color, drawAxis);
        model = popMatrix(matrixStack);

        // right calf
        model = mat4.translate(model, [.8,0,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['rightCalf']), [0,0,-1]); 
        model = mat4.translate(model, [.7,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1.5, .7, 1]); 
        color = [1.0, 0.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        // right foot
        model = mat4.translate(model, [.5,0.07,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['rightFoot']), [0,0,-1]); 
        model = mat4.translate(model, [.5,0.07,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [.5, 1, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        model = popMatrix(matrixStack);
        /////////////////////////////////////////////////////////////
        // draw neck
        model = mat4.translate(model, [0,.3,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['neck']), [0,0,-1]); 
        model = mat4.translate(model, [0,.3,0]); 
        pushMatrix(matrixStack,model);
        pushMatrix(matrixStack,model);
        model = mat4.scale(model, [.5, .5, 1]); 
        color = [0.0, 0.0, 1.0, 1.0]; 
        drawbox(model, color, drawAxis);
        model = popMatrix(matrixStack);

        // head
        model = mat4.translate(model, [0,.5,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['head']), [0,0,-1]); 
        model = mat4.translate(model, [0,.5,0]); 
        pushMatrix(matrixStack,model);
        pushMatrix(matrixStack,model);
        pushMatrix(matrixStack,model);
        pushMatrix(matrixStack,model);
        model = mat4.scale(model, [1.5, 1.5, 1]); 
        color = [1.0, 0.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);

        // hair 1-1
        model = mat4.translate(model, [-.75,.7,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['hair11']), [0,0,-1]); 
        model = mat4.translate(model, [0.5,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1, .2, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);
        model = popMatrix(matrixStack);

        // hair 2-1
        model = mat4.translate(model, [-.75,.7,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['hair21']), [0,0,-1]); 
        model = mat4.translate(model, [0.5,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1, .2, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);
        model = popMatrix(matrixStack);

        // hair 3-1
        model = mat4.translate(model, [.75,.7,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['hair31']), [0,0,-1]); 
        model = mat4.translate(model, [0.5,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1, .2, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);
        model = popMatrix(matrixStack);

        // hair 4-1
        model = mat4.translate(model, [.75,.7,0]); 
        model = mat4.rotate(model, degToRad(degreeDict['hair41']), [0,0,-1]); 
        model = mat4.translate(model, [0.5,0,0]); 
        pushMatrix(matrixStack,model); 
        model = mat4.scale(model, [1, .2, 1]); 
        color = [0.0, 1.0, 0.0, 1.0]; 
        drawbox(model, color, drawAxis); 
        model = popMatrix(matrixStack);
        model = popMatrix(matrixStack);
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
var Z_angle =0; 

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

    ///////////////////////////////////////////////////////////////

    function webGLStart() {
        var canvas = document.getElementById("code03-canvas");
        initGL(canvas);
        initShaders();

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.uColor = gl.getUniformLocation(shaderProgram, "uColor");

        initSquareBuffers(); 
        initAxesBuffers(); 

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

       document.addEventListener('mousedown', onDocumentMouseDown,
       false); 
       document.addEventListener('keydown', onKeyDown, false);

       mvMatrix = mat4.create(); 
       mat4.identity(mvMatrix);
       mvMatrix = mat4.translate(mvMatrix, [0, 0.3, 0]); 
       mvMatrix = mat4.scale(mvMatrix, [0.2, 0.2, 0.2]);

       drawScene();
    }

function BG(red, green, blue) {

    gl.clearColor(red, green, blue, 1.0);
    drawScene(); 

} 

function redraw() {
    drawScene();
}
    

function geometry(type) {
    draw_type = type;
    drawScene();
} 

var drawAxis = false; 

function draw_axis(){
   drawAxis = !drawAxis; 
   drawScene(); 
}

var delta = 0.2;
///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
    function onKeyDown(event) {
        var key = event.key;
        console.log(key);
        switch(key)  {
            case 'Q':
                console.log('enter Q');
                degreeDict['leftArm'] += 10;
                break;
            case 'q':
                console.log('enter q');
                degreeDict['leftArm'] -= 10;
                break;
            case 'P':
                console.log('enter P');
                degreeDict['rightArm'] += 10;
                break;
            case 'p':
                console.log('enter p');
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
            case 'O':
                console.log('enter O');
                degreeDict['rightForearm'] += 10;
                break;
            case 'o':
                console.log('enter o');
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
            case 'L':
                console.log('enter L');
                degreeDict['rightThigh'] += 10;
                break;
            case 'l':
                console.log('enter l');
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
            case 'K':
                console.log('enter K');
                degreeDict['rightCalf'] += 10;
                break;
            case 'k':
                console.log('enter k');
                degreeDict['rightCalf'] -= 10;
                break;
            case 'J':
                console.log('enter J');
                degreeDict['rightFoot'] += 10;
                break;
            case 'j':
                console.log('enter j');
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
            case 'R':
                console.log('enter R');
                mvMatrix = mat4.rotate(mvMatrix, degToRad(5.0), [0, 0, -1]);
                break;
            case 'r':
                console.log('enter r');
                mvMatrix = mat4.rotate(mvMatrix, degToRad(5.0), [0, 0, 1]);
                break; 
            case 'E': 
                console.log('enter E');
                mvMatrix = mat4.scale(mvMatrix, [1.05, 1.05, 1.05]);
                break;
            case 'e':
                console.log('enter e');
                mvMatrix = mat4.scale(mvMatrix, [0.95, 0.95, 0.95]);
                break;
            case 'H': case 'h':
                console.log('enter H/h');
                mvMatrix = mat4.translate(mvMatrix, [0.1, 0, 0]);
                break;
            case 'G': case 'g':
                console.log('enter G/g');
                mvMatrix = mat4.translate(mvMatrix, [-0.1, 0, 0]);
                break;
            case 'Y': case 'y':
                console.log('enter Y/y');
                mvMatrix = mat4.translate(mvMatrix, [0.0, 0.1, 0]);
                break;
            case 'B': case 'b':
                console.log('enter B/b');
                mvMatrix = mat4.translate(mvMatrix, [0.0, -0.1, 0]);
                break;
      }

	drawScene();	 // draw the VBO 
    }