const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;

let gl = null;

function logIf(text) {
  if (text) {
    console.log(text);
  }
}

function init() {
  canvas.width = width;
  canvas.height = height;
  gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `#version 300 es
precision mediump float;

in vec3 pos;
in vec3 dir;
in vec3 norm;
in float fraction;

flat out vec3 fragNorm;


void main() {
  gl_Position = vec4(pos + fraction * dir, 1);
  fragNorm = norm;
}
`);
  gl.compileShader(vertexShader);
  logIf(gl.getShaderInfoLog(vertexShader));
  gl.attachShader(program, vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
precision mediump float;

flat in vec3 fragNorm;
out vec4 col;

void main() {
  col = vec4(0.3, 0.0, 1.0, 1.0) + vec4(1, 1, 1, 1) * 0.25 * fragNorm.z;
}
`);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  logIf(gl.getProgramInfoLog(program));

  gl.useProgram(program);
  
  const vbo = gl.createVertexArray();
  gl.bindVertexArray(vbo);

  const length = 30;

  let itemSize = 2 * 3 * 3;
  const bufferData = new Float32Array(length * itemSize);
  for (let i = 0; i < length; ++i) {
    const fraction = i / (length - 1);
    let angle = 1 * TAU * fraction
    let radius = 0.5
    bufferData[i * itemSize + 0] = -1 + 2 * fraction;
    bufferData[i * itemSize + 1] = -0.5 + 1 * fraction + radius * Math.cos(angle);
    bufferData[i * itemSize + 2] = radius * Math.sin(angle);

    angle = 1 + 3 * TAU * fraction;
    radius = 0.5;
    bufferData[i * itemSize + 3] = 0;
    bufferData[i * itemSize + 4] = radius * Math.cos(angle);
    bufferData[i * itemSize + 5] = radius * Math.sin(angle);

    angle += TAU / 4;
    bufferData[i * itemSize + 6] = 0;
    bufferData[i * itemSize + 7] = Math.cos(angle + TAU / 4);
    bufferData[i * itemSize + 8] = Math.sin(angle + TAU / 4);
   
    bufferData[i * itemSize + 9] = bufferData[i * itemSize + 0];
    bufferData[i * itemSize + 10] = bufferData[i * itemSize + 1];
    bufferData[i * itemSize + 11] = bufferData[i * itemSize + 2];

    bufferData[i * itemSize + 12] = -bufferData[i * itemSize + 3];
    bufferData[i * itemSize + 13] = -bufferData[i * itemSize + 4];
    bufferData[i * itemSize + 14] = -bufferData[i * itemSize + 5];

    bufferData[i * itemSize + 15] = bufferData[i * itemSize + 6];
    bufferData[i * itemSize + 16] = bufferData[i * itemSize + 7];
    bufferData[i * itemSize + 17] = bufferData[i * itemSize + 8];
  }
  let stride = 3 * 3 * 4;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
  const posLocation = gl.getAttribLocation(program, 'pos');
  gl.enableVertexAttribArray(posLocation);
  gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, gl.FALSE, stride, 0);
  const dirLocation = gl.getAttribLocation(program, 'dir');
  gl.enableVertexAttribArray(dirLocation);
  gl.vertexAttribPointer(dirLocation, 3, gl.FLOAT, gl.FALSE, stride, 3 * 4);
  const normLocation = gl.getAttribLocation(program, 'norm');
  gl.enableVertexAttribArray(normLocation);
  gl.vertexAttribPointer(normLocation, 3, gl.FLOAT, gl.FALSE, stride, 2 * 3 * 4);
  
  itemSize = 2;
  const fractionBufferData = new Float32Array(length * itemSize);
  for (let i = 0; i < length; ++i) {
    const fraction = i / (length - 1);
    fractionBufferData[i * itemSize + 0] = fraction;
    fractionBufferData[i * itemSize + 1] = fraction;
  }
  const fractionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fractionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, fractionBufferData, gl.STATIC_DRAW);
  const fractionLocation = gl.getAttribLocation(program, 'fraction');
  gl.enableVertexAttribArray(fractionLocation);
  gl.vertexAttribPointer(fractionLocation, 1, gl.FLOAT, gl.FALSE, 1 * 4, 0);
  
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, length * 2);
}

function main() {
  init();
  window.gl = gl;
}
main();
