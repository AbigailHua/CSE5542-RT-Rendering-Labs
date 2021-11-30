var cubemapTexture;
function initBuffers() {
    // initCylinderBuffer();
    initCubeBuffer();
    initVaseBuffer();
    // initSphereBuffer();
    // initTetrahedronBuffer();
    // initConeBuffer();
    initLightBuffer();
    initCubeMap();
}

function initCubeMap() {
    cubemapTexture = gl.createTexture();
    cubemapTexture.image = new Image();
    cubemapTexture.image.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image.src = texturePath.wall;
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

    const cubeTexCoords = [
        1,0,1,1,0,1,
        1,0,0,1,0,0,
        1,1,0,1,0,0,
        1,1,0,0,1,0,
        0,1,1,1,1,0,
        0,1,1,0,0,0,
        1,1,1,0,0,0,
        1,1,0,0,0,1,
        1,1,0,1,0,0,
        1,1,0,0,1,0,
        0,1,1,1,1,0,
        0,1,1,0,0,0
    ];
    cubeVertexTexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexCoords), gl.STATIC_DRAW);
    cubeVertexTexCoordsBuffer.itemSize = 2;
    cubeVertexTexCoordsBuffer.numItems = 36;
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

// Reference: https://blog.csdn.net/qq_31804159/article/details/80084601
function initVaseBuffer() {
    var vaseVertex = [];
    var vaseNormal = [];
    var vaseTexcood = [];
 
    var mincal = .5;
    var maxcal = 1;//最小口径和最大口径
    var height = 3.3;//定义花瓶高度
    var step = height/v_levels;
    for (var i=0; i<v_levels;i++){
        var y = i*step;
        var r1 = mincal*Math.sin(degToRad(y)*100)+maxcal;
        var r2 = mincal*Math.sin(degToRad(y+step)*100)+maxcal;
        let angleStep = 2*PI/h_levels;

        for(var j=0; j<h_levels;j++){ //每一层的划分
            var angle1 = angleStep*j;
            var angle2 = angleStep*(j+1);
            //生成顶点v1,v2在切片i上 v3,v4在切片i+step上，四个点构成一个四角面
            v1 = [r1*Math.cos(angle1),r1*Math.sin(angle1), y];
            v2 = [r1*Math.cos(angle2),r1*Math.sin(angle2),y];
            v3 = [r2*Math.cos(angle2),r2*Math.sin(angle2),y+step];
            v4 = [r2*Math.cos(angle1),r2*Math.sin(angle1),y+step];

            // normals
            n1 = cross(difference(v3, v2), difference(v1, v2));
            n2 = cross(difference(v1, v4), difference(v3, v4));

            //生成对应的纹理坐标
            t1 = [j/h_levels,i/v_levels];
            t2 = [(j+1)/h_levels, i/v_levels];
            t3 = [(j+1)/h_levels, (i+1)/v_levels];
            t4 = [j/h_levels,(i+1)/v_levels];

            vaseVertex.push(v1);
            vaseVertex.push(v2);
            vaseVertex.push(v3);
            vaseVertex.push(v1);
            vaseVertex.push(v3);
            vaseVertex.push(v4);

            vaseNormal.push(n1);
            vaseNormal.push(n1);
            vaseNormal.push(n1);
            vaseNormal.push(n2);
            vaseNormal.push(n2);
            vaseNormal.push(n2);
 
            vaseTexcood.push(t1);
            vaseTexcood.push(t2);
            vaseTexcood.push(t3);
            vaseTexcood.push(t1);
            vaseTexcood.push(t3);
            vaseTexcood.push(t4);
        }
    }

    vaseVertex = vaseVertex.flat();
    vaseNormal = vaseNormal.flat();
    vaseTexcood = vaseTexcood.flat();
    
    vaseVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vaseVertex), gl.STATIC_DRAW);
    vaseVertexPositionBuffer.itemSize = 3;
    vaseVertexPositionBuffer.numItems = vaseVertex.length/3;

    vaseVertexNormalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vaseNormal), gl.STATIC_DRAW);
    vaseVertexNormalBuffer.itemSize = 3;
    vaseVertexNormalBuffer.numItems = vaseNormal.length/3;

    vaseVertexTexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexTexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vaseTexcood), gl.STATIC_DRAW);
    vaseVertexTexCoordsBuffer.itemSize = 2;
    vaseVertexTexCoordsBuffer.numItems = vaseTexcood.length/2;
}

///////////////////////////////////////////////////////////////

function drawScene() {
    var matrixStack = [];

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 
    
    mat4.identity(mMatrix);	

    if (!isFirstPerson) {
        vMatrix = mat4.lookAt(cameraPos, cameraCenter, cameraViewUp, vMatrix);	// set up the view matrix, multiply into the modelview matrix
        vMatrix = mat4.rotate(vMatrix, -degToRad(Z_angle.global), [0, 0, 1]);
    }
    else {
        vMatrix = mat4.lookAt(firstPersonPos, firstPersonCenter, firstPersonViewUp, vMatrix);
        vMatrix = mat4.translate(vMatrix, firstPersonPos);
        vMatrix = mat4.rotate(vMatrix, -degToRad(Z_angle.firstPerson), [0, 0, 1]);
        vMatrix = mat4.translate(vMatrix, firstPersonPos.map(v => -v));
    }

    mat4.multiply(vMatrix, mMatrix, mvMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix
    mat4.identity(v2wMatrix);
    v2wMatrix = mat4.multiply(v2wMatrix, vMatrix); 
    v2wMatrix = mat4.transpose(v2wMatrix);

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    
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

    // drawLight();

    model = mat4.multiply(model, mvMatrix);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);
    pushMatrix(matrixStack, model);

    // first person
    model = mat4.translate(model, firstPersonPos);
    model =  mat4.scale(model, [.1, .1, .1]);
    model = mat4.rotate(model, degToRad(Z_angle.firstPerson), [0, 0, 1]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.fullLight);
    drawCube(model);
    model = popMatrix(matrixStack);
    
    // book obj
    model = mat4.rotate(model, degToRad(90), [1, 0, 0]);
    model = mat4.translate(model, [wall.thickness*10, wall.height*0.55, wall.width*0.4]);
    model =  mat4.scale(model, [.2, .2, .2]);
    model = mat4.rotate(model, degToRad(90), [0, 1, 0]);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    drawOBJ(model);
    model = popMatrix(matrixStack);

    // shelf1
    model = mat4.translate(model, [shelf.width*0.9, shelfPos.y1, shelfPos.z1]);
    model =  mat4.scale(model, [shelf.width, shelf.len, shelf.thickness]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wood, 27);
    drawCube(model);
    model = popMatrix(matrixStack);

    // cube mapped vase
    model = mat4.translate(model, [wall.thickness*10, -room.len*0.3, room.height*0.71]);
    model =  mat4.scale(model, [.05, .05, .05]);
    gl.uniform1i(shaderProgram.lightMode, mode.cubeMap);
    drawVaseCubeMap(model);
    model = popMatrix(matrixStack);

    // shelf2
    model = mat4.translate(model, [shelf.width*0.9, shelfPos.y2, shelfPos.z2]);
    model =  mat4.scale(model, [shelf.width, shelf.len*1.5, shelf.thickness]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wood, 27);
    drawCube(model);
    model = popMatrix(matrixStack);

    // vase
    model = mat4.translate(model, [wall.thickness*10, room.len*0.17, room.height*0.66]);
    model =  mat4.scale(model, [.05, .05, .05]);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.blue, 29);
    drawVase(model);
    model = popMatrix(matrixStack);

    // shelf3
    model = mat4.translate(model, [shelf.width*0.9, shelfPos.y3, shelfPos.z3]);
    model =  mat4.scale(model, [shelf.width, shelf.len*1.5, shelf.thickness]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wood, 27);
    drawCube(model);
    model = popMatrix(matrixStack);

    // back wall
    model = mat4.translate(model, [wall.thickness/2, 0, wall.height/2]);
    model =  mat4.scale(model, [wall.thickness, room.len, wall.height]);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wall, 30);
    drawCube(model);
    model = popMatrix(matrixStack);
    
    // right wall
    model = mat4.translate(model, [room.width/2, room.len/2+wall.thickness/2, wall.height/2]);
    model =  mat4.scale(model, [room.width, wall.thickness, wall.height]);
    model = mat4.rotate(model, degToRad(-90), [0, 1, 0]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wall, 31);
    drawCube(model);
    model = popMatrix(matrixStack);

    // left wall
    model = mat4.translate(model, [room.width/2, -room.len/2-wall.thickness/2, wall.height/2]);
    model =  mat4.scale(model, [room.width, wall.thickness, wall.height]);
    model = mat4.rotate(model, degToRad(-90), [0, 1, 0]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wall, 31);
    drawCube(model);
    model = popMatrix(matrixStack);

    // floor
    model = mat4.translate(model, [room.width/2, 0, wall.thickness/2]);
    model =  mat4.scale(model, [room.width, room.len, wall.thickness]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.floor, 28);
    drawCube(model);
    model = popMatrix(matrixStack);

    // ceiling
    model = mat4.translate(model, [room.width/2, 0, -wall.thickness/2+room.height]);
    model =  mat4.scale(model, [room.width, room.len, wall.thickness]);
    nMatrix = getNMatrix(model);
    gl.uniform1i(shaderProgram.lightMode, mode.texture);
    setTexture(textureSet.wall, 31);
    drawCube(model);
    model = popMatrix(matrixStack);

}

function drawCube(mvMatrix, color=color_white) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, cubeVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 

    if (draw_type==1) gl.drawArrays(gl.LINE_LOOP, 0, cubeVertexPositionBuffer.numItems);	
    else if (draw_type==0) gl.drawArrays(gl.POINTS, 0, cubeVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, cubeVertexPositionBuffer.numItems);

}

function drawVase(mvMatrix, texture=null, color=color_white, useTexture=31) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vaseVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vaseVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexTexCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, vaseVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(mvMatrix, color);   // pass the modelview mattrix and projection matrix to the shader 
    
    if (draw_type==1) gl.drawArrays(gl.LINE_LOOP, 0, vaseVertexPositionBuffer.numItems);	
    else if (draw_type==0) gl.drawArrays(gl.POINTS, 0, vaseVertexPositionBuffer.numItems);
    else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, vaseVertexPositionBuffer.numItems);

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

function drawVaseCubeMap(mvMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vaseVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vaseVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vaseVertexTexCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, vaseVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(mvMatrix);   // pass the modelview mattrix and projection matrix to the shader

    gl.activeTexture(gl.TEXTURE20);   // set texture unit 1 to use 
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cube_map_textureUniform, 20);   // pass the texture unit to the shader
    if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, vaseVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, vaseVertexPositionBuffer.numItems);
	else if (draw_type==2) gl.drawArrays(gl.TRIANGLES, 0, vaseVertexPositionBuffer.numItems);	
}