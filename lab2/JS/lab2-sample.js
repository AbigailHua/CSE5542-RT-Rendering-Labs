///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 2  Sample Code
//     Han-Wei Shen
//     9/16/2019 
//
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

const NUM_OF_SHAPES = 5;
var PositionBufferList = [];
var ColorBufferList = [];

const itemSize = 3;
const numItems = [1, 2, 3, 6, custom_vertices_length/3];
const ShapeVertexList = [
    [
         0.0, 0.0, 0.0
    ],
    [
        -0.1, 0.0, 0.0,
	     0.1, 0.0, 0.0
    ],
    [
         0.0, 0.1, 0.0,
         0.1,-0.1, 0.0,
        -0.1,-0.1, 0.0
    ],
    [
        -0.1, 0.1, 0.0,
         0.1, 0.1, 0.0,
         0.1,-0.1, 0.0,
        -0.1,-0.1, 0.0,
        -0.1, 0.1, 0.0,
         0.1,-0.1, 0.0
    ],
    custom_shape_vertices
];
const ShapeColorList = [
    [
        1.0, 0.0, 0.0
    ],
    [
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ],
    [
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ],
    [
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ],
    new Array(custom_shape_vertices.length/3).fill([1.0, 0.0, 0.0]).flat()
];
var ShapeModeList = [];
var point_colors;
var line_colors;
var triangle_colors;
var square_colors;
var custom_shape_colors;

const POINT_SIZE = 5.0;
const SHIFT_DISTANCE = 0.03;
const ROTATION_ANGLE = 10;

var shape2Num = {'p': 0, 'l': 1, 't': 2, 'q': 3, 'o': 4};
var shape_size = [0, 0, 0, 0, 0];     // shape size counter 

var colors = [];   // I am not doing colors, but you should :-) 
var shapes = [];   // the array to store what shapes are in the list

var translation_matrices = [];
var shapes_scale= [];   // scaling factor (uniform is assumed)  

var polygon_mode = 'h';  //default = h line 
var color_mode  = 'r';

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
    } catch (e) {}
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
    ShapeModeList = [gl.POINTS, gl.LINES, gl.TRIANGLES, gl.TRIANGLES, gl.TRIANGLES];
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab1-canvas");
    initGL(canvas);
    initShaders();
    ////////
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    ////////
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    ////////
    shaderProgram.pointSize = gl.getUniformLocation(shaderProgram, "pointSize");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    initScene();
    
    // document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}


//////////////////////////////////////////////////////////////////
/////////////             Create VBOs            /////////////////
function CreateBuffer() {
    for (let i=0; i<NUM_OF_SHAPES; i++) {
        PositionBufferList.push(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, PositionBufferList[i]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ShapeVertexList[i]), gl.STATIC_DRAW);
        PositionBufferList[i].itemSize = itemSize;
        PositionBufferList[i].numItems = numItems[i];

        ColorBufferList.push(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, ColorBufferList[i]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ShapeColorList[i]), gl.STATIC_DRAW);
        ColorBufferList[i].itemSize = itemSize;
        ColorBufferList[i].numItems = numItems[i];
    }
}

///////////////////////////////////////////////////////

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function setPointSize() {
    gl.uniform1f(shaderProgram.pointSize, pointSize);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


///////////////////////////////////////////////////////
var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw 
var pointSize = POINT_SIZE;
function draw_lines() {   // lab1 sample - draw lines only 
    

    shapes.forEach((value, i) => {
        mvMatrix = translation_matrices[i];
        pointSize = POINT_SIZE * shapes_scale[i];

        let current_colors;
        if (colors[i] == 'r') current_colors = [1.0, 0.0, 0.0];
        else if (colors[i] == 'g') current_colors = [0.0, 1.0, 0.0];
        else if (colors[i] == 'b') current_colors = [0.0, 0.0, 1.0];
        
        setMatrixUniforms();   // pass the matrix to the vertex shader

        if (value == 'p') setPointSize();
            
        let tmp = shape2Num[value];
        gl.bindBuffer(gl.ARRAY_BUFFER, PositionBufferList[tmp]);    // make the point current buffer 
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, PositionBufferList[tmp].itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, ColorBufferList[tmp]);
        ShapeColorList[i] = new Array(numItems[tmp]).fill(current_colors).flat();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ShapeColorList[i]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, ColorBufferList[tmp].itemSize, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(ShapeModeList[tmp], 0, PositionBufferList[tmp].numItems);
    });
}

///////////////////////////////////////////////////////////////////////
// this is the function that you create all shape VBOs to be drawn later 
function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY);
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer(); 
}

///////////////////////////////////////////////////////////////////////
// my sample code only draw lines but you should draw all other shapes 
function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_lines();
}


///////////////////////////////////////////////////////////////
//   Below are mouse and key event handlers 
//

var Z_angle = 0.0;
var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////

// function onDocumentMouseDown( event ) {
//     event.preventDefault();
//     document.addEventListener( 'mousemove', onDocumentMouseMove, false );
//     document.addEventListener( 'mouseup', onDocumentMouseUp, false );
//     document.addEventListener( 'mouseout', onDocumentMouseOut, false );

//     var mouseX = event.clientX;
//     var mouseY = event.ClientY; 

//     lastMouseX = mouseX;
//     lastMouseY = mouseY;
    
    
//     var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
//     var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1 ;
//     console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

//     shapes.push(polygon_mode);
//     colors.push(color_mode);
//     shapes_tx.push(NDC_X); shapes_ty.push(NDC_Y); shapes_rotation.push(0.0); shapes_scale.push(1.0);

//     Z_angle = 0.0;
//     shape_size++;

//     console.log("size=", shape_size);
//     console.log("shape = ", polygon_mode);
    
//     drawScene();	 // draw the VBO 
// }


////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers 
//
    //  function onDocumentMouseMove( event ) {  //update the rotation angle 
	//  var mouseX = event.clientX;
    //      var mouseY = event.ClientY; 

    //      var diffX = mouseX - lastMouseX;
    //      var diffY = mouseY - lastMouseY;

    //      Z_angle = Z_angle + diffX/5;
	 
    //      lastMouseX = mouseX;
    //      lastMouseY = mouseY;
	//  shapes_rotation[shape_size-1] = Z_angle;   // update the rotation angle 

	//  drawScene();	 // draw the VBO 
    //  }
    //  function onDocumentMouseUp( event ) {
    //      document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    //      document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    //      document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    //  }

    //  function onDocumentMouseOut( event ) {
    //       document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    //       document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    //       document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    //  }

function addShape() {
    shapes.push(polygon_mode);
    colors.push(color_mode);
    
    var tmpMatrix = mat4.create();
    mat4.identity(tmpMatrix);
    // random location
    tmpMatrix = mat4.translate(tmpMatrix, [Math.random()*2-1, Math.random()*2-1, 0]);  // move from origin to mouse click 

    translation_matrices.push(tmpMatrix);
    shapes_scale.push(1.0);

    Z_angle = 0.0;
    shape_size[shape2Num[polygon_mode]]++;
}

///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
function onKeyDown(event) {
    console.log(event.keyCode);
    switch(event.keyCode)  {
        ////////////////////////////////////
        /////////      shape      //////////
        ////////////////////////////////////
        // point
        case 80:
            if (event.shiftKey) {
                console.log('enter P');
            } else {
                console.log('enter p');
            }
            polygon_mode = 'p';
            addShape();
            break;
        // line
        case 76:
            if (event.shiftKey) {
                console.log('enter L');
            } else {
                console.log('enter l');		  
            }
            polygon_mode = 'l';
            addShape();
            break;
        // triangle
        case 84:
            if (event.shiftKey) {
                console.log('enter T');
            } else {
                console.log('enter t');
            }
            polygon_mode = 't';
            addShape();
            break;
        // square
        case 81:
            if (event.shiftKey) {
                console.log('enter Q');
            } else {
                console.log('enter q');
            }
            polygon_mode = 'q';
            addShape();
            break;
        // custom shape
        case 79:
            if (event.shiftKey) {
                console.log('enter O');
            } else {
                console.log('enter o');
            }
            polygon_mode = 'o';
            addShape();
            break;
        ////////////////////////////////////
        /////////   translation   //////////
        ////////////////////////////////////
        // a: move left
        case 65:
            if (event.shiftKey) {
                console.log('enter A');
            } else {
                console.log('enter a');
            }
            mvMatrix = translation_matrices.pop();
            mvMatrix = mat4.translate(mvMatrix, [-SHIFT_DISTANCE, 0, 0]);
            translation_matrices.push(mvMatrix);
            break;
        // d: move right
        case 68:
            if (event.shiftKey) {
                console.log('enter D');
            } else {
                console.log('enter d');
            }
            mvMatrix = translation_matrices.pop();
            mvMatrix = mat4.translate(mvMatrix, [SHIFT_DISTANCE, 0, 0]);
            translation_matrices.push(mvMatrix);
            break;
        // s: move down
        case 83:
            if (event.shiftKey) {
                console.log('enter S');
            } else {
                console.log('enter s');
            }
            mvMatrix = translation_matrices.pop();
            mvMatrix = mat4.translate(mvMatrix, [0, -SHIFT_DISTANCE, 0]);
            translation_matrices.push(mvMatrix);
            break;
        // w: move up
        case 87:
            if (event.shiftKey) {
                console.log('enter W');
            } else {
                console.log('enter w');
            }
            mvMatrix = translation_matrices.pop();
            mvMatrix = mat4.translate(mvMatrix, [0, SHIFT_DISTANCE, 0]);
            translation_matrices.push(mvMatrix);
            break;
        ////////////////////////////////////
        /////////      color      //////////
        ////////////////////////////////////
        case 82:
            if (event.shiftKey) {
                console.log('enter R');
                // rotation
                mvMatrix = translation_matrices.pop();
                mvMatrix = mat4.rotate(mvMatrix, degToRad(ROTATION_ANGLE), [0, 0, 1]);  // rotate if any	  	  
                translation_matrices.push(mvMatrix);
            }
            else {
                console.log('enter r');
                color_mode = 'r';
                colors[colors.length-1] = color_mode;
                // colors.push(color_mode);		  
            }
            break;
        case 71:
            if (event.shiftKey) {
                console.log('enter G');
            }
            else {
                console.log('enter g');
            }
            color_mode = 'g';
            colors[colors.length-1] = color_mode;
            // colors.push(color_mode);
            break;
        case 66:
            if (event.shiftKey) {
                console.log('enter B');
            }
            else {
                console.log('enter b');
            }
            color_mode = 'b';
            colors[colors.length-1] = color_mode;
            // colors.push(color_mode);
            break;
        case 69:
            if (event.shiftKey) {
                console.log('enter E');
                shapes_scale[shapes.length-1] *= 1.1;
                if (polygon_mode == 'p') {
                    pointSize *= 1.1;
                } else {
                    mvMatrix = translation_matrices.pop();
                    mvMatrix = mat4.scale(mvMatrix, [1.1, 1.1, 1.1]);
                    translation_matrices.push(mvMatrix);
                }  	  
            }
            else {
                console.log('enter e');
                shapes_scale[shapes.length-1] *= 0.9;
                if (polygon_mode == 'p') {
                    pointSize *= 0.9;
                } else {
                    mvMatrix = translation_matrices.pop();
                    mvMatrix = mat4.scale(mvMatrix, [0.9, 0.9, 0.9]);
                    translation_matrices.push(mvMatrix);
                }  	  		  
            }
            break;
        // clear
        case 67:
            if (event.shiftKey) {
                console.log('enter C');
            } else {
                console.log('enter c');
            }
            shapes = [];
            colors = [];
            shape_size = [0,0,0,0];
            shapes_scale = [];
            translation_matrices = [];
            Z_angle = 0.0;
            break;
    }

    drawScene();	 // draw the VBO 
}

