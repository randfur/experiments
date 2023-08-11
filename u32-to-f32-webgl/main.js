function main() {
  document.body.style = `
    background: black;
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = 1000;
  canvas.height = 1000;

  const gl = canvas.getContext('webgl2');

  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `#version 300 es
    precision mediump float;

    const float width = float(${canvas.width});
    const float height = float(${canvas.height});

    in uint x;
    in uint y;

    void main() {
      gl_Position = vec4(float(x), float(y), 0, 1);
    }
  `);
  gl.compileShader(vertexShader);
  logIf(gl.getShaderInfoLog(vertexShader));
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    out vec4 colour;

    void main() {
      colour = vec4(1, 0, 0, 1);
    }
  `);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  logIf(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const glBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

  const xAttrib = gl.getAttribLocation(program, 'x');
  const yAttrib = gl.getAttribLocation(program, 'y');
  gl.enableVertexAttribArray(xAttrib);
  gl.enableVertexAttribArray(yAttrib);
  gl.vertexAttribIPointer(xAttrib, 1, gl.UNSIGNED_INT, gl.FALSE, 8, 0);
  gl.vertexAttribIPointer(yAttrib, 1, gl.UNSIGNED_INT, gl.FALSE, 8, 4);

  const typedBuffer = new Uint32Array([
    0, 0,
    100, 0,
    0, 100,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, typedBuffer, gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function logIf(text) {
  if (text) {
    console.log(text);
  }
}

main();
