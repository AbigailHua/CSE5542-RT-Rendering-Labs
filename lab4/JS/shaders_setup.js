
    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    function initShaders() {

        shaderProgramPhong = gl.createProgram();

        var fragmentShaderPhong = getShader(gl, "shader-fs-phong");
        var vertexShaderPhong = getShader(gl, "shader-vs-phong");

        gl.attachShader(shaderProgramPhong, fragmentShaderPhong);
        gl.attachShader(shaderProgramPhong, vertexShaderPhong);
        gl.linkProgram(shaderProgramPhong);

        if (!gl.getProgramParameter(shaderProgramPhong, gl.LINK_STATUS)) {
            alert("Could not initialise phong shaders");
        }

        shaderProgramToon = gl.createProgram();

        var fragmentShaderToon = getShader(gl, "shader-fs-toon");
        var vertexShaderToon = getShader(gl, "shader-vs-toon");

        gl.attachShader(shaderProgramToon, vertexShaderToon);
        gl.attachShader(shaderProgramToon, fragmentShaderToon);
        gl.linkProgram(shaderProgramToon);

        if (!gl.getProgramParameter(shaderProgramToon, gl.LINK_STATUS)) {
            alert("Could not initialise toon shaders");
        }

        shaderProgram = shaderProgramPhong;

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    }

    function switchShader() {
        if (shaderMode == 0) shaderProgram = shaderProgramToon;
        else shaderProgram = shaderProgramPhong;

        shaderMode = 1 - shaderMode;

        gl.useProgram(shaderProgram);
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

        gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.lightMode = gl.getUniformLocation(shaderProgram, "mode");
	
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	
    }

