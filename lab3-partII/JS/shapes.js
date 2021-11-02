var drawAxis = true;
var cameraPos = [0, 0, 5];
var cameraCenter = [0, 0, 0];
var cameraViewUp = [0, 1, 0];
var degreeDict = {
    'badget': 0,
    'leftArm': 120, 'leftForearm': 0,
    'rightArm': 60, 'rightForearm': 0,
    'leftThigh': 90, 'leftCalf': 0, 'leftFoot': 0,
    'rightThigh': 90, 'rightCalf': 0, 'rightFoot': 0,
    'neck': 0, 'head': 0,
    'hair11': 105, 'hair12': 0,
    'hair21': 120, 'hair22': 0,
    'hair31': 75, 'hair32': 0,
    'hair41': 60, 'hair42': 0,
    'hat': 0
};

////////////////    Initialize VBO  ////////////////////////
function initBuffers() {
    initCubeBuffer();
    initTetrahedronBuffer();
    initCylinderBuffer();
    initConeBuffer();
    initSphereBuffer();
    initAxesBuffers();
}

function initAxesBuffers() {

    AxesVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxesVertexPositionBuffer);
    var vertices = [
        0.0,  0.0,  0.0,
        0.0,  1.0,  0.0, 
        0.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        0.0,  0.0,  0.0,
        0.0,  0.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    AxesVertexPositionBuffer.vertexSize = 3;
    AxesVertexPositionBuffer.numVertices = 6;
}

function initCubeBuffer() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    var vertices = [
         0.5,  0.5, -.5,
        -0.5,  0.5, -.5, 
        -0.5, -0.5, -.5,
         0.5, -0.5, -.5,
         0.5,  0.5,  .5,
        -0.5,  0.5,  .5, 
        -0.5, -0.5,  .5,
         0.5, -0.5,  .5
    
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 8;

    var indices = [
        0,1,2,
        0,2,3,
        0,3,7,
        0,7,4,
        6,2,3,
        6,3,7,
        5,1,2,
        5,2,6,
        5,1,0,
        5,0,4,
        5,6,7,
        5,7,4
    ];
    cubeVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    cubeVertexIndexBuffer.itemsize = 1;
    cubeVertexIndexBuffer.numItems = 36;   //36 indices, 3 per triangle, so 12 triangles 

    // cubeVertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    // var colors = [
    //     1.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0,
    //     0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0,
    //     1.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0,
    //     0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0	    
    // ];
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // cubeVertexColorBuffer.itemSize = 3;
    // cubeVertexColorBuffer.numItems = 8;
}

function initTetrahedronBuffer() {
    tetrahedronVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
    var vertices = [
        0, 0, Math.sqrt(6)/4,
        0, 1/Math.sqrt(3), -Math.sqrt(6)/12,
        .5, -1/2/Math.sqrt(3), -Math.sqrt(6)/12,
        -.5, -1/2/Math.sqrt(3), -Math.sqrt(6)/12,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    tetrahedronVertexPositionBuffer.itemSize = 3;
    tetrahedronVertexPositionBuffer.numItems = 4;

    var indices = [
        0,1,2,
        0,1,3,
        0,2,3,
        1,2,3
    ];
    tetrahedronVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tetrahedronVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    tetrahedronVertexIndexBuffer.itemsize = 1;
    tetrahedronVertexIndexBuffer.numItems = 12;   //36 indices, 3 per triangle, so 12 triangles 

    // tetrahedronVertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexColorBuffer);
    // var colors = [
    //     1.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0,
    //     0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0,   
    // ];
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // tetrahedronVertexColorBuffer.itemSize = 3;
    // tetrahedronVertexColorBuffer.numItems = 4;
}

function initCylinderBuffer(radius=1, height=1) {
    cylinderVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    var sampleNum = 20;
    var halfHeight = height / 2;
    var circle_vertices = Array.from(Array(sampleNum).keys()).map((v, idx) => {
        let reg = 2 * Math.PI * idx / sampleNum;
        return [radius*Math.cos(reg)/2, radius*Math.sin(reg)/2];
    });
    var vertices = circle_vertices.map((v, idx) => {
        return [halfHeight, v[0], v[1]];
    });
    vertices = vertices.concat(circle_vertices.map((v, idx) => {
        return [-halfHeight, v[0], v[1]];
    }));
    vertices = vertices.flat();

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cylinderVertexPositionBuffer.itemSize = 3;
    cylinderVertexPositionBuffer.numItems = 2*sampleNum;

    var indices = Array.from(Array(sampleNum-1).keys()).map((v, idx) => {
        return [
            idx, idx+sampleNum, idx+sampleNum+1,
            idx, idx+1, idx+sampleNum+1,
        ];
    }).concat([
        sampleNum-1, 2*sampleNum-1, sampleNum,
        sampleNum-1, 0, sampleNum
    ]).flat();

    cylinderVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    cylinderVertexIndexBuffer.itemsize = 1;
    cylinderVertexIndexBuffer.numItems = 2*sampleNum*3;   //36 indices, 3 per triangle, so 12 triangles 

    // cylinderVertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
    // var colors = Array.from(Array(2*sampleNum).keys()).map((v, idx) => {
    //     switch(idx%3){
    //         case 0: return [1, 0, 0];
    //         case 1: return [0, 1, 0];
    //         case 2: return [0, 0, 1];
    //     }
    // }).flat();
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // cylinderVertexColorBuffer.itemSize = 3;
    // cylinderVertexColorBuffer.numItems = 2*sampleNum;
}

function initConeBuffer(radius=1, height=1) {
    coneVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexPositionBuffer);
    var sampleNum = 20;
    var heightThird = height/3;
    var vertices = [0, 2*heightThird, 0].concat(Array.from(Array(sampleNum).keys()).map((v, idx) => {
        let reg = 2 * Math.PI * idx / sampleNum;
        return [radius*Math.cos(reg)/2, -heightThird, radius*Math.sin(reg)/2 ];
    })).flat();

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    coneVertexPositionBuffer.itemSize = 3;
    coneVertexPositionBuffer.numItems = 1+sampleNum;

    var indices = Array.from(Array(sampleNum-1).keys()).map((v, idx) => {
        return [
            0, idx+1, idx+2
        ];
    }).concat([
        sampleNum, 0, 1
    ]).flat();

    coneVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    coneVertexIndexBuffer.itemsize = 1;
    coneVertexIndexBuffer.numItems = 3*sampleNum;   //36 indices, 3 per triangle, so 12 triangles 

    // coneVertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexColorBuffer);
    // var colors = Array.from(Array(2*sampleNum).keys()).map((v, idx) => {
    //     switch(idx%3){
    //         case 0: return [1, 0, 0];
    //         case 1: return [0, 1, 0];
    //         case 2: return [0, 0, 1];
    //     }
    // }).flat();
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // coneVertexColorBuffer.itemSize = 3;
    // coneVertexColorBuffer.numItems = 1+sampleNum;
}

function initSphereBuffer(radius=1) {
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    
    // create vertex array
    var phiNum = 20;
    var thetaNum = 40;
    var vertices = [0, 0, radius];
    for (let i=1; i<phiNum; i++) {
        let phi = Math.PI * i / phiNum;
        let z = radius*Math.cos(phi);
        let cof = Math.sin(phi);
        for (let j=0; j<thetaNum; j++) {
            let theta = 2 * Math.PI * j / thetaNum;
            vertices.push(radius*cof*Math.sin(theta));
            vertices.push(radius*cof*Math.cos(theta));
            vertices.push(z);
        }
    }
    vertices = vertices.concat([0, 0, -radius]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = (phiNum-1)*thetaNum+2;

    // create indices array
    var lastIndex = (phiNum-1)*thetaNum+1;
    var round = (phiNum-2)*thetaNum;
    var indices = Array.from(Array(thetaNum-1).keys()).map(
        v => [0, v+1, v+2, lastIndex, v+1+round, v+2+round]).flat();
    indices.push(0);
    indices.push(1);
    indices.push(thetaNum);
    indices.push(lastIndex);
    indices.push(1+round);
    indices.push(thetaNum+round);

    for (let i=0; i<phiNum-2; i++) {
        for (let j=1; j<thetaNum; j++) {
            indices.push(j+thetaNum*i);
            indices.push(j+thetaNum*(i+1));
            indices.push(j+thetaNum*(i+1)+1);

            indices.push(j+thetaNum*i);
            indices.push(j+thetaNum*i+1);
            indices.push(j+thetaNum*(i+1)+ 1);
        }
        indices.push(thetaNum*(i+1));
        indices.push(thetaNum*(i+2));
        indices.push(thetaNum*(i+1)+1);

        indices.push(thetaNum*(i+1));
        indices.push(thetaNum*i+1);
        indices.push(thetaNum*(i+1)+1);
    }

    sphereVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    sphereVertexIndexBuffer.itemsize = 1;
    sphereVertexIndexBuffer.numItems = indices.length;   //36 indices, 3 per triangle, so 12 triangles 

    // sphereVertexColorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
    // // var colors = Array.from(Array(2*sampleNum).keys()).map((v, idx) => {
    // //     switch(idx%3){
    // //         case 0: return [1, 0, 0];
    // //         case 1: return [0, 1, 0];
    // //         case 2: return [0, 0, 1];
    // //     }
    // // }).flat();
    // var colors = Array.from(Array(indices.length/3).keys()).map((v, idx) => {
    //     switch(idx%3){
    //         case 0: return [1, 0, 0];
    //         case 1: return [0, 1, 0];
    //         case 2: return [0, 0, 1];
    //     }
    // }).flat();
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // sphereVertexColorBuffer.itemSize = 3;
    // sphereVertexColorBuffer.numItems = thetaNum*phiNum+2;
}

///////////////////////////////////////////////////////////////

function drawScene() {
    var matrixStack = [];
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

    mat4.identity(vMatrix);
    vMatrix = mat4.lookAt(cameraPos, cameraCenter, cameraViewUp, vMatrix);	// set up the view matrix, multiply into the modelview matrix

    mat4.identity(mMatrix);	

    console.log('Z angle = '+ Z_angle); 
    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle), [0, 1, 1]);   // now set up the model matrix 
    mat4.translate(mMatrix, translation);
    mat4.scale(mMatrix, [scale, scale, scale]);
    mat4.multiply(vMatrix,mMatrix, mvMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix 
    
    
    var color = [1.0, 1.0, 1.0, 1.0]; 

    var model = mat4.create(); 
    mat4.identity(model);

    // now draw a little box 
    model = mat4.multiply(model, mvMatrix);
    model = mat4.translate(model, [0, .5, 0]);
    model =  mat4.scale(model, [.5, .5, .5]);
    pushMatrix(matrixStack, model); 
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    model = mat4.translate(model, [0, -1.15, 0]);
    model =  mat4.scale(model, [2,3,1]); 
    color = [1.0, 1.0, 0.0, 1.0];
    drawCube(model, color, drawAxis);
    model = popMatrix(matrixStack);

    ///////////////////////////////////////////////
    // draw badget
    model = mat4.translate(model, [0, -.5,.8]); 
    model = mat4.rotate(model, degToRad(degreeDict['badget']), [0,0,-1]); 
    // model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    // model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawTetrahedron(model, color, drawAxis);
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    ///////////////////////////////////////////////
    // draw the right arm
    model = mat4.translate(model, [1,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightArm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawCube(model, color, drawAxis);
    model = popMatrix(matrixStack);

    // right forearm
    model = mat4.translate(model, [.75,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightForearm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack); 

    model = popMatrix(matrixStack); 

    ///////////////////////////////////////////////
    // draw the left arm
    model = mat4.translate(model, [-1,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftArm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack); 

    // left forearm
    model = mat4.translate(model, [.75,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftForearm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    model = popMatrix(matrixStack); 

    ///////////////////////////////////////////////
    // draw the left thigh 
    model = mat4.translate(model, [-1,-2.3,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftThigh']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack); 

    // left calf
    model = mat4.translate(model, [.8,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftCalf']), [0,0,-1]); 
    model = mat4.translate(model, [.7,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    // left foot
    model = mat4.translate(model, [.5,-0.07,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftFoot']), [0,0,-1]); 
    model = mat4.translate(model, [.5,-0.07,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [.5, 1, .7]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    model = popMatrix(matrixStack); 

    ///////////////////////////////////////////////////////////
    // draw the right thigh
    model = mat4.translate(model, [1,-2.3,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightThigh']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawCube(model, color, drawAxis);
    model = popMatrix(matrixStack);

    // right calf
    model = mat4.translate(model, [.8,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightCalf']), [0,0,-1]); 
    model = mat4.translate(model, [.7,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    // right foot
    model = mat4.translate(model, [.5,0.07,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightFoot']), [0,0,-1]); 
    model = mat4.translate(model, [.5,0.07,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [.5, 1, .7]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCube(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    model = popMatrix(matrixStack);

    /////////////////////////////////////////////////////////////
    // draw neck
    model = mat4.translate(model, [0,.3,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['neck']), [0,0,-1]); 
    model = mat4.translate(model, [0,.3,0]); 
    pushMatrix(matrixStack,model);
    pushMatrix(matrixStack,model);
    model = mat4.scale(model, [.5, .5, .5]); 
    color = [0.0, 0.0, 1.0, 1.0]; 
    drawCube(model, color, drawAxis);
    model = popMatrix(matrixStack);

    // head
    model = mat4.translate(model, [0,.8,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['head']), [0,0,-1]); 
    model = mat4.translate(model, [0,.5,0]); 
    pushMatrix(matrixStack,model);
    pushMatrix(matrixStack,model);
    pushMatrix(matrixStack,model);
    pushMatrix(matrixStack,model);
    pushMatrix(matrixStack,model);
    model = mat4.scale(model, [1.2, 1.2, 1.2]); 
    color = [1.0, 0.0, 0.0, 1.0]; 
    drawSphere(model, color, drawAxis); 
    model = popMatrix(matrixStack);

    // hair 1-1
    model = mat4.translate(model, [-1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair11']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model);
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCylinder(model, color, drawAxis); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 2-1
    model = mat4.translate(model, [-1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair21']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCylinder(model, color, drawAxis); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 3-1
    model = mat4.translate(model, [1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair31']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCylinder(model, color, drawAxis); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 4-1
    model = mat4.translate(model, [1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair41']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCylinder(model, color, drawAxis); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hat
    model = mat4.translate(model, [0,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hat']), [0,0,-1]); 
    model = mat4.translate(model, [0,1.5,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.2, 1.2, 1.2]); 
    color = [0.0, 1.0, 0.0, 1.0]; 
    drawCone(model, color, drawAxis); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);
}

function drawCube(mvMatrix, color, drawaxis) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, cubeVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, cubeVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    if (drawaxis) draw_Axes(mvMatrix); 
}

function drawTetrahedron(mvMatrix, color, drawaxis) {
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tetrahedronVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,tetrahedronVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tetrahedronVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, tetrahedronVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, tetrahedronVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, tetrahedronVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    if (drawaxis) draw_Axes(mvMatrix); 
}

function drawCylinder(mvMatrix, color, drawaxis) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,cylinderVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, cylinderVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, cylinderVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, cylinderVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    if (drawaxis) draw_Axes(mvMatrix); 
}

function drawCone(mvMatrix, color, drawaxis) {
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, coneVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,coneVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, coneVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, coneVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, coneVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    if (drawaxis) draw_Axes(mvMatrix); 
}

function drawSphere(mvMatrix, color, drawaxis) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, sphereVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, sphereVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    if (drawaxis) draw_Axes(mvMatrix); 
}