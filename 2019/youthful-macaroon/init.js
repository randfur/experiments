import * as utils from './utils.js';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext('webgl');
const squares = 20;

const translateStep = 0.1
const rotateStep = TAU/100

function initInputs(transformObj) {
  addEventListener("keydown", eventObj => {
    switch(eventObj.key) {
      case "ArrowUp": 
        transformObj.translatePos.y += translateStep;
        break;
      case "ArrowDown":
        transformObj.translatePos.y -= translateStep;
        break;
      case "ArrowRight":
        transformObj.rotateY += rotateStep;
        break;
      case "ArrowLeft":
        transformObj.rotateY -= rotateStep;
        break;
    }
  });
}


function initGraphics() {
  

const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  //attribute vec3 translate;
  gl.shaderSource(vertexShader, `
    precision mediump float;
    varying vec3 pos;

    const float TAU = radians(360.0);
    const float radius = 1.0;

    uniform float screenWidth;
    uniform float screenHeight;
    uniform float translateX;
    uniform float translateY;
    uniform float translateZ;

    uniform float rotateY;

    attribute vec2 sphericalPos;

    vec3 getPos(float theta, float alpha) {
      vec3 result = radius * vec3(
            cos(theta) * cos(alpha),  // X
            sin(theta) * cos(alpha),  // Y
            sin(alpha)                // Z
        );
      result.x += translateX;
      result.y += translateY;
      result.z += translateZ;

      return result;
    }

    vec3 rotatePosDifferent() {
      vec3 result = pos;
      // Rotate result by using complex number multiplication 
      // (x+zi)*(cos0+isin0)
      // xcos0 + xisin0 + zicos0 -zsin0
      // (xcos0-zsin0) + i(xsin0 +zcos0))

      result.x = (result.x * cos(rotateY)) - result.z * sin(rotateY);
      // Note result.x is being modified lol
      result.z = (result.x * sin(rotateY)) + result.z * cos(rotateY);
      return result;
    }

    vec3 rotatePos() {
      return vec3(
        pos.x * cos(rotateY) - pos.z * sin(rotateY),
        pos.y,
        pos.x * sin(rotateY) + pos.z * cos(rotateY));
    }

    void main() {
      pos = getPos(sphericalPos.x, sphericalPos.y);
      gl_Position = vec4(rotatePos(), 1);
      if (screenWidth > screenHeight) {
        gl_Position.x *= screenHeight / screenWidth;
      } else {
        gl_Position.y *= screenWidth / screenHeight;
      }
    }
  `);
  gl.compileShader(vertexShader);
  utils.logIf(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `
  precision mediump float;

  varying vec3 pos;

  uniform float screenWidth;
  uniform float screenHeight;
  uniform float lightness;

  void main() {
    gl_FragColor = vec4(
        lightness * gl_FragCoord.x / screenWidth,
        lightness * gl_FragCoord.y / screenHeight,
        lightness * pos.z,
        1
    );
  }
  `);
  gl.compileShader(fragmentShader);
  utils.logIf(gl.getShaderInfoLog(fragmentShader));

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  utils.logIf(gl.getProgramInfoLog(program));

  const data = [];

  for (let i of utils.range(squares)) {
    const theta = i / squares * TAU;
    const nextTheta = (i + 1) / squares * TAU;
    for (let j of utils.range(squares)) {
      const alpha = (j / squares / 2 - 0.25) * TAU;    
      const nextAlpha = ((j + 1) / squares / 2 - 0.25) * TAU;    
      data.push(theta, alpha);
      data.push(theta, nextAlpha);
      data.push(nextTheta, alpha);
      data.push(nextTheta, alpha);
      data.push(theta, nextAlpha);
      data.push(nextTheta, nextAlpha);
    }
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  gl.uniform1f(gl.getUniformLocation(program, 'screenWidth'), innerWidth);
  gl.uniform1f(gl.getUniformLocation(program, 'screenHeight'), innerHeight);

  const sphericalPos = gl.getAttribLocation(program, 'sphericalPos');
  gl.enableVertexAttribArray(sphericalPos);
  gl.vertexAttribPointer(sphericalPos, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);

  return {data, program}
}

export default function init() {
  let transformObj = {
    translatePos: {x:0, y:0, z:0},
    rotateY: 0
  }
  initInputs(transformObj);
  let {data, program} = initGraphics();
  return {data, program, gl, transformObj};
}

