

///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 1  Sample Code
//     Han-Wei Shen
//
//     In this sample code I show you how to draw h and v lines from mouse clicks 
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height;

var VertexPositionBuffer;

var total_vertex_cnt = 0;     // shape size counter 

var vbo_vertices = [];  // i only store line vertices, 2 points per click zzz

var point_index = [];
var line_index = [];
var triangle_index = [];

var colors = [];   // I am not doing colors, but you should :-) 
var shapes = [];   // the array to store what shapes are in the list 

var polygon_mode = '';
var color_mode = 'r';

var triangle_size = 0.05;
var square_size = 0.1

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    var canvas = document.getElementById("lab1-canvas");
    initGL(canvas);
    initShaders();
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    initScene();

    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onKeyDown, false);
}


///////////////////////////////////////////////////////////
///////               Create VBO          /////////////////
function CreateBuffer() {
    VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_vertices), gl.STATIC_DRAW);
    VertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    // VertexPositionBuffer.numItems = total_vertex_cnt * 3;// this example only draw lines, so n*2 vertices 
}

///////////////////////////////////////////////////////
function draw_lines() {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // draw points
    point_index.forEach((value) => {
        gl.drawArrays(gl.POINTS, value, 1);
    });
    // draw lines
    line_index.forEach((value) => {
        gl.drawArrays(gl.LINES, value, 2);
    });
    // draw triangles
    triangle_index.forEach((value) => {
        gl.drawArrays(gl.TRIANGLES, value, 3);
    })
    
}

///////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth; vp_width = vp_maxX - vp_minX + 1;
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY - vp_minY + 1;
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY);
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth; vp_width = vp_maxX - vp_minX + 1;
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY - vp_minY + 1;
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY);
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_lines();
}


///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////

function randomDraw() {
    // event.preventDefault();
    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('mouseup', onDocumentMouseUp, false);
    // document.addEventListener('mouseout', onDocumentMouseOut, false);

    //  var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
    //  var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1 ;
    var NDC_X = Math.random() * 1.98 - 0.99;
    var NDC_Y = Math.random() * 1.98 - 0.99;
    console.log("NDC click", NDC_X, NDC_Y);

    if (polygon_mode == 'p') { // add point
        point_index.push(total_vertex_cnt);
        total_vertex_cnt += 1;
        vbo_vertices.push(NDC_X);
        vbo_vertices.push(NDC_Y);
        vbo_vertices.push(0.0);
    }
    else if (polygon_mode == 'h') {       // add the two points of h line
        line_index.push(total_vertex_cnt);
        total_vertex_cnt += 2;
        vbo_vertices.push(NDC_X - 0.1);
        vbo_vertices.push(NDC_Y);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X + 0.1);
        vbo_vertices.push(NDC_Y);
        vbo_vertices.push(0.0);
    }
    else if (polygon_mode == 'v') {  // add two end points of the v line 
        line_index.push(total_vertex_cnt);
        total_vertex_cnt += 2;
        vbo_vertices.push(NDC_X);
        vbo_vertices.push(NDC_Y - 0.1);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X);
        vbo_vertices.push(NDC_Y + 0.1);
        vbo_vertices.push(0.0);
    } else if (polygon_mode == 't') { // add triangle
        triangle_index.push(total_vertex_cnt);
        total_vertex_cnt += 3;
        vbo_vertices.push(NDC_X);
        vbo_vertices.push(NDC_Y + 2*triangle_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X + 1.732*triangle_size);
        vbo_vertices.push(NDC_Y - triangle_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X - 1.732*triangle_size);
        vbo_vertices.push(NDC_Y - triangle_size);
        vbo_vertices.push(0.0);
    } else if (polygon_mode == 'q') {
        triangle_index.push(total_vertex_cnt);
        triangle_index.push(total_vertex_cnt+3);
        total_vertex_cnt += 6;
        //    .
        //  . .
        vbo_vertices.push(NDC_X - square_size);
        vbo_vertices.push(NDC_Y - square_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X + square_size);
        vbo_vertices.push(NDC_Y - square_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X + square_size);
        vbo_vertices.push(NDC_Y + square_size);
        vbo_vertices.push(0.0);

        // . .
        // .
        vbo_vertices.push(NDC_X - square_size);
        vbo_vertices.push(NDC_Y - square_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X + square_size);
        vbo_vertices.push(NDC_Y + square_size);
        vbo_vertices.push(0.0);

        vbo_vertices.push(NDC_X - square_size);
        vbo_vertices.push(NDC_Y + square_size);
        vbo_vertices.push(0.0);
    } else if (polygon_mode == 'c') {  // clear
        vbo_vertices = [];
        point_index = [];
        line_index = [];
        triangle_index = [];
        total_vertex_cnt = 0;
    } else {
        console.log("Invalid Input! Discard")
        return;
    };

    shapes.push(polygon_mode);
    colors.push(color_mode);
    console.log("size=", total_vertex_cnt);
    console.log("shape = ", polygon_mode);

    CreateBuffer(); // create VBO for the lines 
    drawScene();	 // draw the VBO 
}


////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers 
//

// function onDocumentMouseMove(event) {
//     var mouseX = event.clientX;
//     var mouseY = event.ClientY;
// }

// function onDocumentMouseUp(event) {
//     document.removeEventListener('mousemove', onDocumentMouseMove, false);
//     document.removeEventListener('mouseup', onDocumentMouseUp, false);
//     document.removeEventListener('mouseout', onDocumentMouseOut, false);
// }

// function onDocumentMouseOut(event) {
//     document.removeEventListener('mousemove', onDocumentMouseMove, false);
//     document.removeEventListener('mouseup', onDocumentMouseUp, false);
//     document.removeEventListener('mouseout', onDocumentMouseOut, false);
// }


///////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
function onKeyDown(event) {
    console.log(event.keyCode);
    switch (event.keyCode) {
        // point
        case 80:
            if (event.shiftKey) {
                console.log('enter P');
                polygon_mode = 'p'
            }
            else {
                console.log('enter p');
                polygon_mode = 'p'
            }
            break;
        // horizontal line
        case 72:
            if (event.shiftKey) {
                console.log('enter H');
                polygon_mode = 'h'
            }
            else {
                console.log('enter h');
                polygon_mode = 'h'
            }
            break;
        // vertical line
        case 86:
            if (event.shiftKey) {
                console.log('enter V');
                polygon_mode = 'v'
            }
            else {
                console.log('enter v');
                polygon_mode = 'v'
            }
            break;
        // triangle
        case 84:
            if (event.shiftKey) {
                console.log('enter T');
                polygon_mode = 't'
            }
            else {
                console.log('enter t');
                polygon_mode = 't'
            }
            break;
        // square
        case 81:
            if (event.shiftKey) {
                console.log('enter Q');
                polygon_mode = 'q'
            }
            else {
                console.log('enter q');
                polygon_mode = 'q'
            }
            break;
        
        // clear
        case 67:
            if (event.shiftKey) {
                console.log('enter C');
                polygon_mode = 'c'
            }
            else {
                console.log('enter c');
                polygon_mode = 'c'
            }
            break;
        default:
            console.log('enter ', event.keyCode);
            polygon_mode = '';
        // color mode
        // case 82:
        //     if (event.shiftKey) {
        //         console.log('enter R');
        //         color_mode = 'r'
        //     }
        //     else {
        //         console.log('enter r');
        //         color_mode = 'r'
        //     }
        //     break;
        // case 71:
        //     if (event.shiftKey) {
        //         console.log('enter G');
        //         color_mode = 'g'
        //     }
        //     else {
        //         console.log('enter g');
        //         color_mode = 'g'
        //     }
        //     break;
        // case 66:
        //     if (event.shiftKey) {
        //         console.log('enter B');
        //         color_mode = 'b'
        //     }
        //     else {
        //         console.log('enter b');
        //         color_mode = 'b'
        //     }
        //     break;
    }
    console.log('polygon mode =', polygon_mode);
    console.log('color mode =', color_mode);
    randomDraw(event);
}

