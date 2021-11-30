function initOBJLoader(objSrc, mtlSrc) {
    var request = new XMLHttpRequest();
    request.open("GET", objSrc);
    request.onreadystatechange =
        function () {
            if (request.readyState == 4) {
                console.log("state =" + request.readyState);
                mtlLoader(request.responseText, mtlSrc);
            }
        }
    request.send();
}

function mtlLoader(objText, mtlSrc) {
    var request = new XMLHttpRequest();
    request.open("GET", mtlSrc);
    request.onreadystatechange =
        function () {
            if (request.readyState == 4) {
                console.log("state =" + request.readyState);
                var obj = parseOBJ(objText);
                var mtl = parseMTL(request.responseText);
                initOBJBuffers(obj, mtl);
            }
        }
    request.send();
}

var objVertexPositionBuffers = [];
var objVertexNormalBuffers = [];
var objVertexTexCoordBuffers = [];
var mtlKa = [];
var mtlKd = [];
var mtlKs = [];
var mtlShininess = [];
var mtlMapKa = [];
var mtlMapKd = [];
var mtlMapKs = [];

function initOBJBuffers(objData, mtlData) {
    for(var geometry of objData.geometries) {
        var curVertexPositionBuffers = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, curVertexPositionBuffers);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.data.position), gl.STATIC_DRAW);
        curVertexPositionBuffers.itemSize = 3;
        curVertexPositionBuffers.numItems = geometry.data.position.length/3;
        objVertexPositionBuffers.push(curVertexPositionBuffers);

        var curVertexNormalBuffers = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, curVertexNormalBuffers);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.data.normal), gl.STATIC_DRAW);
        curVertexNormalBuffers.itemSize = 3;
        curVertexNormalBuffers.numItems = geometry.data.normal.length/3;
        objVertexNormalBuffers.push(curVertexNormalBuffers);

        var curVertexTexCoordBuffers = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, curVertexTexCoordBuffers);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.data.texcoord), gl.STATIC_DRAW);
        curVertexTexCoordBuffers.itemSize = 2;
        curVertexTexCoordBuffers.numItems = geometry.data.texcoord.length/2;
        objVertexTexCoordBuffers.push(curVertexTexCoordBuffers);

        mtlKa.push(mtlData[geometry.material].ambient);
        mtlKd.push(mtlData[geometry.material].diffuse);
        mtlKs.push(mtlData[geometry.material].specular);
        mtlShininess.push(mtlData[geometry.material].shininess);

        if(mtlData[geometry.material].ambientMap != null) mtlMapKa.push(mtlData[geometry.material].ambientMap);
        else mtlMapKa.push(null);
        if(mtlData[geometry.material].diffuseMap != null) mtlMapKd.push(mtlData[geometry.material].diffuseMap);
        else mtlMapKd.push(null);
        if(mtlData[geometry.material].specularMap != null) mtlMapKs.push(mtlData[geometry.material].specularMap);
        else mtlMapKs.push(null);
    }
}

function drawOBJ(m) {
    for(var i = 0; i < objVertexPositionBuffers.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, objVertexPositionBuffers[i]);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, objVertexPositionBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, objVertexNormalBuffers[i]);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, objVertexNormalBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, objVertexTexCoordBuffers[i]);
        gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, objVertexTexCoordBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.uniform1i(shaderProgram.lightMode, mode.texture);
        setMatrixUniforms(m, color_white);   // pass the modelview mattrix and projection matrix to the shader

        gl.uniform3f(shaderProgram.ambient_coefUniform, mtlKa[i][0], mtlKa[i][1], mtlKa[i][2]); 
        gl.uniform3f(shaderProgram.diffuse_coefUniform, mtlKd[i][0], mtlKd[i][1], mtlKd[i][2]); 
        gl.uniform3f(shaderProgram.specular_coefUniform, mtlKs[i][0], mtlKs[i][1], mtlKs[i][2]);

        // if(mtlMapKa[i] != null) {
            // gl.uniform1i(shaderProgram.enableMapKa, 1);
            gl.activeTexture(gl.TEXTURE0);                 // set texture unit 0 to use
            gl.bindTexture(gl.TEXTURE_2D, mtlMapKa[i]);    // bind the texture object to the texture unit 
            gl.uniform1i(shaderProgram.textureKaUniform, 0);      // pass the texture unit to the shader
        // }
        // else gl.uniform1i(shaderProgram.enableMapKa, 0);

        // if(mtlMapKd[i] != null) {
            // gl.uniform1i(shaderProgram.enableMapKd, 1);
            gl.activeTexture(gl.TEXTURE1);                 // set texture unit 1 to use
            gl.bindTexture(gl.TEXTURE_2D, mtlMapKd[i]);    // bind the texture object to the texture unit 
            gl.uniform1i(shaderProgram.textureKdUniform, 1);      // pass the texture unit to the shader
        // }
        // else gl.uniform1i(shaderProgram.enableMapKd, 0);

        // if(mtlMapKs[i] != null) {
            // gl.uniform1i(shaderProgram.enableMapKs, 1);
            gl.activeTexture(gl.TEXTURE2);                 // set texture unit 2 to use
            gl.bindTexture(gl.TEXTURE_2D, mtlMapKs[i]);    // bind the texture object to the texture unit 
            gl.uniform1i(shaderProgram.textureKsUniform, 2);      // pass the texture unit to the shader
        // }
        // else gl.uniform1i(shaderProgram.enableMapKs, 0);

        gl.drawArrays(gl.TRIANGLES, 0, objVertexPositionBuffers[i].numItems);
    }
    
}