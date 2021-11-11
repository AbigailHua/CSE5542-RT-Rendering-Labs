var mode = 1;
var translation = [0, 0, 0];
var scale = 1;
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

function cross(a, b) {
    return [
        a[1]*b[2]-a[2]*b[1],
        a[2]*b[0]-a[0]*b[2],
        a[0]*b[1]-a[1]*b[0]
    ];
}

function difference(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function initBuffers() {
    initCylinderBuffer();
    initCubeBuffer();
    initSphereBuffer();
    initTetrahedronBuffer();
    initConeBuffer();
    initLightBuffer();
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
    cylinderVertexIndexBuffer.itemSize = 1;
    cylinderVertexIndexBuffer.numItems = 2*sampleNum*3;   //36 indices, 3 per triangle, so 12 triangles

    var normal = vertices.map((v, idx) => {
        if (idx % 3 == 0) return 0;
        return v;
    });
    cylinderVertexNormalBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);  
    cylinderVertexNormalBuffer.itemSize = 3;
    cylinderVertexNormalBuffer.numItems = 2*sampleNum;   //36 indices, 3 per triangle, so 12 triangles
}

function initCubeBuffer() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    var vtx = [
         0.5,  0.5, -.5,
        -0.5,  0.5, -.5, 
        -0.5, -0.5, -.5,
         0.5, -0.5, -.5,
         0.5,  0.5,  .5,
        -0.5,  0.5,  .5, 
        -0.5, -0.5,  .5,
         0.5, -0.5,  .5
    ];

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

    var vertices = [];
    indices.forEach((v) => {
        vertices.push(vtx[v*3]);
        vertices.push(vtx[v*3+1]);
        vertices.push(vtx[v*3+2]);
    });
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 36;

    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var nml = [
        [0.0, 0.0, -1.0],
        [1.0, 0.0, 0.0],
        [0.0, -1.0, 0.0],
        [-1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0]
    ];
    var normal = [];
    nml.forEach((v) => {
        for (let x=0; x<6; x++)
            normal.push(v);
    });
    normal = normal.flat();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 36;
}

function initSphereBuffer(radius=1) {
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    
    // create vertex array
    var phiNum = 20;
    var thetaNum = 40;
    var vertices = [0, 0, radius];
    var normal = [0, 0, radius];
    for (let i=1; i<phiNum; i++) {
        let phi = Math.PI * i / phiNum;
        let z = radius*Math.cos(phi);
        let cof = Math.sin(phi);
        for (let j=0; j<thetaNum; j++) {
            let theta = 2 * Math.PI * j / thetaNum;
            vertices.push(radius*cof*Math.sin(theta));
            vertices.push(radius*cof*Math.cos(theta));
            vertices.push(z);
            normal.push(radius*cof*Math.sin(theta));
            normal.push(radius*cof*Math.cos(theta));
            normal.push(z);
        }
    }
    vertices = vertices.concat([0, 0, -radius]);
    normal = normal.concat([0, 0, -radius]);

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
    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = indices.length;   //36 indices, 3 per triangle, so 12 triangles 
    
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = (phiNum-1)*thetaNum+2;
}

function initLightBuffer(radius=0.2) {
    lightVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightVertexPositionBuffer);
    
    // create vertex array
    var phiNum = 20;
    var thetaNum = 40;
    var vertices = [0, 0, radius];
    var normal = [0, 0, radius];
    for (let i=1; i<phiNum; i++) {
        let phi = Math.PI * i / phiNum;
        let z = radius*Math.cos(phi);
        let cof = Math.sin(phi);
        for (let j=0; j<thetaNum; j++) {
            let theta = 2 * Math.PI * j / thetaNum;
            vertices.push(radius*cof*Math.sin(theta));
            vertices.push(radius*cof*Math.cos(theta));
            vertices.push(z);
            normal.push(radius*cof*Math.sin(theta));
            normal.push(radius*cof*Math.cos(theta));
            normal.push(z);
        }
    }
    vertices = vertices.concat([0, 0, -radius]);
    normal = normal.concat([0, 0, -radius]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    lightVertexPositionBuffer.itemSize = 3;
    lightVertexPositionBuffer.numItems = (phiNum-1)*thetaNum+2;

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

    lightVertexIndexBuffer = gl.createBuffer();	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lightVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
    lightVertexIndexBuffer.itemSize = 1;
    lightVertexIndexBuffer.numItems = indices.length;   //36 indices, 3 per triangle, so 12 triangles 
    
    lightVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    lightVertexNormalBuffer.itemSize = 3;
    lightVertexNormalBuffer.numItems = (phiNum-1)*thetaNum+2;
}

function initTetrahedronBuffer() {
    tetrahedronVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
    var vtx = [
        0, 0, Math.sqrt(6)/4,
        0, 1/Math.sqrt(3), -Math.sqrt(6)/12,
        .5, -1/2/Math.sqrt(3), -Math.sqrt(6)/12,
        -.5, -1/2/Math.sqrt(3), -Math.sqrt(6)/12,
    ];

    var indices = [
        0,1,2,
        0,1,3,
        0,2,3,
        1,2,3
    ];

    var vertices = [];
    indices.forEach((v) => {
        vertices.push(vtx[v*3]);
        vertices.push(vtx[v*3+1]);
        vertices.push(vtx[v*3+2]);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    tetrahedronVertexPositionBuffer.itemSize = 3;
    tetrahedronVertexPositionBuffer.numItems = 12;

    tetrahedronVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexNormalBuffer);
    var nml = [
        [0.7071, 0.4082, 0.2887],
        [-0.7071, 0.4082, 0.2887],
        [0, -0.8165, 0.2887],
        [0, 0, -0.8660]
    ]
    var normal = [];
    nml.forEach(v => {
        for (let x=0; x<3; x++)
            normal.push(v);
    });
    normal = normal.flat();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    tetrahedronVertexNormalBuffer.itemSize = 3;
    tetrahedronVertexNormalBuffer.numItems = 12;
}

function initConeBuffer(radius=1, height=1) {
    var sampleNum = 50;
    var heightThird = height/3;
    var vtx = [0, 2*heightThird, 0].concat(Array.from(Array(sampleNum).keys()).map((v, idx) => {
        let reg = 2 * Math.PI * idx / sampleNum;
        return [radius*Math.cos(reg)/2, -heightThird, radius*Math.sin(reg)/2];
    })).flat();

    var indices = Array.from(Array(sampleNum-1).keys()).map((v, idx) => {
        return [0, idx+1, idx+2];
    }).concat([[0, sampleNum, 1]]);
    var normal = [];
    indices.forEach((v) => {
        let one = [vtx[3*v[0]], vtx[3*v[0]+1], vtx[3*v[0]+2]];
        let two = [vtx[3*v[1]], vtx[3*v[1]+1], vtx[3*v[1]+2]];
        let three = [vtx[3*v[2]], vtx[3*v[2]+1], vtx[3*v[2]+2]];
        let direction = cross(difference(three, one), difference(two, one));
        normal.push(direction);
        normal.push(direction);
        normal.push(direction);
    });
    normal = normal.flat();

    indices = indices.flat();
    var vertices = [];
    indices.forEach((v) => {
        vertices.push(vtx[v*3]);
        vertices.push(vtx[v*3+1]);
        vertices.push(vtx[v*3+2]);
    });

    coneVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    coneVertexPositionBuffer.itemSize = 3;
    coneVertexPositionBuffer.numItems = sampleNum*3;

    coneVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    coneVertexNormalBuffer.itemSize = 3;
    coneVertexNormalBuffer.numItems = sampleNum*3;
}

function getNMatrix(model) {
    xMatrix = mat4.create();
    mat4.identity(xMatrix);
    xMatrix = mat4.multiply(xMatrix, model); 	
    xMatrix = mat4.inverse(xMatrix);
    xMatrix = mat4.transpose(xMatrix);
    return xMatrix;
}

///////////////////////////////////////////////////////////////

function drawScene() {
    var matrixStack = [];

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 
    vMatrix = mat4.lookAt(cameraPos, cameraCenter, cameraViewUp, vMatrix);	// set up the view matrix, multiply into the modelview matrix

    mat4.identity(mMatrix);	

    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle), [0, 1, 1]);   // now set up the model matrix

    mat4.translate(mMatrix, translation);
    mat4.scale(mMatrix, [scale, scale, scale]);
    mat4.multiply(vMatrix, mMatrix, mvMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

    gl.uniform1i(shaderProgram.lightMode, mode);
    
    var light_pos_in_eye = mat4.translate(vMatrix, light_pos_in_world);
    gl.uniform3f(shaderProgram.light_posUniform,light_pos_in_eye[12], light_pos_in_eye[13], light_pos_in_eye[14]); 	
    gl.uniform3f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2]); 
    gl.uniform3f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2]); 
    gl.uniform3f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2]); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

    gl.uniform3f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2]); 
    gl.uniform3f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2]); 
    gl.uniform3f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2]); 

    var model = mat4.create(); 
    mat4.identity(model);

    drawLight();

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
    color = [1.0, 1.0, 0.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
    model = popMatrix(matrixStack);
    
    ///////////////////////////////////////////////
    // draw badget
    model = mat4.translate(model, [0, -.5,.8]); 
    model = mat4.rotate(model, degToRad(degreeDict['badget']), [0,0,-1]); 
    // model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    // model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0];
    nMatrix = getNMatrix(model);
    drawTetrahedron(model, nMatrix, color);
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    ///////////////////////////////////////////////
    // draw the right arm
    model = mat4.translate(model, [1,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightArm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
    model = popMatrix(matrixStack);

    // right forearm
    model = mat4.translate(model, [.75,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightForearm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color); 
    model = popMatrix(matrixStack); 
    model = popMatrix(matrixStack);

    ///////////////////////////////////////////////
    // draw the left arm
    model = mat4.translate(model, [-1,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftArm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
    model = popMatrix(matrixStack); 

    // left forearm
    model = mat4.translate(model, [.75,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftForearm']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack); 

    ///////////////////////////////////////////////
    // draw the left thigh 
    model = mat4.translate(model, [-1,-2.3,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftThigh']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color); 
    model = popMatrix(matrixStack); 

    // left calf
    model = mat4.translate(model, [.8,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftCalf']), [0,0,-1]); 
    model = mat4.translate(model, [.7,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color); 
    model = popMatrix(matrixStack);

    // left foot
    model = mat4.translate(model, [.5,-0.07,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['leftFoot']), [0,0,-1]); 
    model = mat4.translate(model, [.5,-0.07,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [.5, 1, .7]); 
    color = [0.0, 1.0, 0.0];
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

///////////////////////////////////////////////////////////
    // draw the right thigh
    model = mat4.translate(model, [1,-2.3,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightThigh']), [0,0,-1]); 
    model = mat4.translate(model, [.75,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .8]); 
    color = [0.0, 0.0, 1.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
    model = popMatrix(matrixStack);

    // right calf
    model = mat4.translate(model, [.8,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightCalf']), [0,0,-1]); 
    model = mat4.translate(model, [.7,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .7, .7]); 
    color = [1.0, 0.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
    model = popMatrix(matrixStack);

    // right foot
    model = mat4.translate(model, [.5,0.07,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['rightFoot']), [0,0,-1]); 
    model = mat4.translate(model, [.5,0.07,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [.5, 1, .7]); 
    color = [0.0, 1.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
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
    color = [0.0, 0.0, 1.0]; 
    nMatrix = getNMatrix(model);
    drawCube(model, nMatrix, color);
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
    color = [1.0, 0.0, 0.0];
    nMatrix = getNMatrix(model);
    drawSphere(model, nMatrix, color); 
    model = popMatrix(matrixStack);

    // hair 1-1
    model = mat4.translate(model, [-1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair11']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model);
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCylinder(model, nMatrix, color);
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 2-1
    model = mat4.translate(model, [-1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair21']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCylinder(model, nMatrix, color);
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 3-1
    model = mat4.translate(model, [1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair31']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCylinder(model, nMatrix, color);
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hair 4-1
    model = mat4.translate(model, [1.1,.6,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hair41']), [0,0,-1]); 
    model = mat4.translate(model, [0.5,0,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.5, .2, .2]); 
    color = [0.0, 1.0, 0.0]; 
    nMatrix = getNMatrix(model);
    drawCylinder(model, nMatrix, color); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);

    // hat
    model = mat4.translate(model, [0,0,0]); 
    model = mat4.rotate(model, degToRad(degreeDict['hat']), [0,0,-1]); 
    model = mat4.translate(model, [0,1.5,0]); 
    pushMatrix(matrixStack,model); 
    model = mat4.scale(model, [1.2, 1.2, 1.2]); 
    color = [0.0, 1.0, 0.0];
    nMatrix = getNMatrix(model); 
    drawCone(model, nMatrix, color); 
    model = popMatrix(matrixStack);
    model = popMatrix(matrixStack);
}

function drawCube(mvMatrix, nMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);


    setMatrixUniforms(mvMatrix, nMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, cubeVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, cubeVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, cubeVertexPositionBuffer.numItems);

}

function drawCylinder(mvMatrix, nMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer); 	

    setMatrixUniforms(mvMatrix, nMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, cylinderVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, cylinderVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, cylinderVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
}

function drawSphere(mvMatrix, nMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer); 

    setMatrixUniforms(mvMatrix, nMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, sphereVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, sphereVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 

    // if (drawaxis) draw_Axes(mvMatrix); 
}

function drawTetrahedron(mvMatrix, nMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tetrahedronVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tetrahedronVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, tetrahedronVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);


    setMatrixUniforms(mvMatrix, nMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, tetrahedronVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, tetrahedronVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, tetrahedronVertexPositionBuffer.numItems);
}

function drawCone(mvMatrix, nMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, coneVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, coneVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(mvMatrix, nMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, coneVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, coneVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, coneVertexPositionBuffer.numItems);
}

function drawLight() {
    gl.bindBuffer(gl.ARRAY_BUFFER, lightVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lightVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, lightVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, lightVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lightVertexIndexBuffer); 

    var lightMV = mat4.create();
    mat4.identity(lightMV);
    mat4.translate(lightMV, light_pos_in_world);
    mat4.multiply(vMatrix, lightMV, lightMV);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, lightMV);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
    
    // white light, change the color
    gl.uniform3f(shaderProgram.ambient_coefUniform, 1, 1, 1);
    gl.uniform3f(shaderProgram.light_ambientUniform, 1, 1, 1);

    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, lightVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, lightVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawElements(gl.TRIANGLES, lightVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0); 
    
    gl.uniform3f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2]);
    gl.uniform3f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2]);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}