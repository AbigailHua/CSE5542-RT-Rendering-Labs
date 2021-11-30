const PI = Math.PI;
var glTextureDict;
var textureSet = {};

function degToRad(degrees) {
    return degrees * PI / 180;
 }

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

function getNMatrix(model) {
    xMatrix = mat4.create();
    mat4.identity(xMatrix);
    xMatrix = mat4.multiply(xMatrix, model); 	
    xMatrix = mat4.inverse(xMatrix);
    xMatrix = mat4.transpose(xMatrix);
    return xMatrix;
}

function setTexture(texture, num) {
    if (!texture) return;
    gl.activeTexture(gl.TEXTURE0+num);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform3f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2]); 
    gl.uniform3f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2]); 
    gl.uniform3f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2]); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

    gl.uniform3f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2]); 
    gl.uniform3f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2]); 
    gl.uniform3f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2]);

    gl.uniform1i(shaderProgram.textureKaUniform, num);
    gl.uniform1i(shaderProgram.textureKdUniform, num);
    gl.uniform1i(shaderProgram.textureKsUniform, num);
}

function handleCubemapTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT); 
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image);    
}