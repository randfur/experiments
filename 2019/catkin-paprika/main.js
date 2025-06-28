const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;

function logIf(text) {
  if (text !== '') {
    console.log(text);
  }
}

const gl = canvas.getContext('webgl2');
const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `#version 300 es
precision mediump float;
in vec2 pos;
void main() {
  gl_Position = vec4(pos, 0, 1);
}
`);
gl.compileShader(vertexShader);
logIf(gl.getShaderInfoLog(vertexShader));
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `#version 300 es
precision mediump float;
out vec4 col;
void main() {
  col = vec4(0.2, 0.4, 0.8, 1);
}
`);
gl.compileShader(fragmentShader);
logIf(gl.getShaderInfoLog(fragmentShader))
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);
const pos = gl.getAttribLocation(program, 'pos');
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT, gl.FALSE, 64/8, 0);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,
  1, -1,
  1, 1,
  1, 1,
  -1, 1,
  -1, -1,
]), gl.STATIC_DRAW);

gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.bindVertexArray(null);

console.log('All good.');
