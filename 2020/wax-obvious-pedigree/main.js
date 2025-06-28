'use strict';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;

const gridWidth = Math.floor(width);
const gridHeight = Math.floor(height);
const gridSize = 3;
const pointSize = 1;

const zoomOut = 3;
const timeSlow = 1;

let gl = null;

let frameBuffer = null;

let textureToWrite = null;
let textureToRead = null;

let quadBuffer = null;
let gridPosBuffer = null;

let updateProgram = null;
let renderProgram = null;

function logIf(text) {
  if (text && text !== '') {
    console.log(text);
    output.textContent += text + '\n';
  }
}

function swapTextures() {
  const temp = textureToRead;
  textureToRead = textureToWrite;
  textureToWrite = temp;
}

function init() {
  canvas.width = width;
  canvas.height = height;
  gl = canvas.getContext('webgl2');
  
  const initProgram = gl.createProgram();

  // CReate vertex shader that does nothing.
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


  // create fragment shader that outputs nice inital grid posititenso
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    uniform float gridWidth;
    uniform float gridHeight;

    out vec4 col;

    void main() {
      // float angle = gl_FragCoord.x / gridWidth * 6.28318;
      // col.rg = vec2(cos(angle), sin(angle)) * gl_FragCoord.y / gridHeight * float(${gridSize});
      col.rg = (vec2((gl_FragCoord.xy - vec2(0.5)) / vec2(gridWidth, gridHeight)) * 2.0 - vec2(1)) * float(${gridSize});
      col.r *= gridWidth / gridHeight;
      col.ba = vec2(0, 1);
    }
  `);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));

  // compile and stuff program
  gl.attachShader(initProgram, vertexShader);
  gl.attachShader(initProgram, fragmentShader);

  gl.linkProgram(initProgram);
  logIf(gl.getProgramInfoLog(initProgram));

  // Create arary buffer of quad to cover canvas
  let quadBufferData = new Float32Array([
    1, 1,
    -1, 1,
    -1, -1,
    -1, -1,
    1, -1,
    1, 1,
  ]);
  quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadBufferData, gl.STATIC_DRAW);

  // bind buffer to program inputs and sutff.
  gl.useProgram(initProgram);
  initProgram.vertexArray = gl.createVertexArray();
  gl.bindVertexArray(initProgram.vertexArray);
  const posLocation = gl.getAttribLocation(initProgram, 'pos');
  gl.enableVertexAttribArray(initProgram, posLocation);
  gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 4 * 2, 0);

  // gradb unoiform locaitons
  initProgram.uniformGridWidth = gl.getUniformLocation(initProgram, 'gridWidth');
  initProgram.uniformGridHeight = gl.getUniformLocation(initProgram, 'gridHeight');


  // CReate grid textures with RG32F format
  gl.getExtension('EXT_color_buffer_float');
  textureToWrite = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureToWrite);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, gridWidth, gridHeight, 0, gl.RG, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  textureToRead = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureToRead);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, gridWidth, gridHeight, 0, gl.RG, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // SSet textureToWrite as framebuffer taregt to render to
  frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.bindTexture(gl.TEXTURE_2D, textureToWrite);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureToWrite, 0);
  gl.viewport(0, 0, gridWidth, gridHeight);
  
  // set uniforms
  gl.uniform1f(initProgram.uniformGridWidth, gridWidth);
  gl.uniform1f(initProgram.uniformGridHeight, gridHeight);

  // DRAW
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // swap textures, inited texturer eady to read.
  swapTextures();
}

function update() {
  //creat promasm for performing the x,y => x',y' transform from read texture to write texture.
  if (!updateProgram) {
    updateProgram = gl.createProgram();
    
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
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `#version 300 es
      precision mediump float;

      uniform float time;
      uniform float gridWidth;
      uniform float gridHeight;
      uniform sampler2D sampler;
      out vec4 col;

      float square(float x) {
        return x * x;
      }

      void main() {
        vec2 pos = texture(sampler, gl_FragCoord.xy / vec2(gridWidth, gridHeight)).rg;
        float x = pos.x;
        float y = pos.y;
        col = vec4(pos, 0, 1);
        col.xy += vec2(
           y * (x + sin(time / 1.25) * 0.5) / 100.0,
          1.0 / (y  + 4000.0) + cos(x * 2.0) / 100.0
        ) / float(${timeSlow});
      }
    `);
    gl.compileShader(fragmentShader);
    logIf(gl.getShaderInfoLog(fragmentShader));
    
    gl.attachShader(updateProgram, vertexShader);
    gl.attachShader(updateProgram, fragmentShader);
    gl.linkProgram(updateProgram);
    logIf(gl.getProgramInfoLog(updateProgram));
    
    updateProgram.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(updateProgram.vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLocation = gl.getAttribLocation(updateProgram, 'pos');
    gl.enableVertexAttribArray(updateProgram, posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 4 * 2, 0);
    
    updateProgram.uniformTime = gl.getUniformLocation(updateProgram, 'time');
    updateProgram.uniformGridWidth = gl.getUniformLocation(updateProgram, 'gridWidth');
    updateProgram.uniformGridHeight = gl.getUniformLocation(updateProgram, 'gridHeight');
    updateProgram.uniformSampler = gl.getUniformLocation(updateProgram, 'sampler');
  }

  // restorte update pipeline
  gl.useProgram(updateProgram);
  gl.bindVertexArray(updateProgram.vertexArray);

  // Set read texture as texture to read from
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureToRead);
  
  // set write texture as target to render to
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureToWrite);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureToWrite, 0);
  gl.viewport(0, 0, gridWidth, gridHeight);
  
  // uniformssss
  gl.uniform1f(updateProgram.uniformTime, performance.now() / 1000);
  gl.uniform1f(updateProgram.uniformGridWidth, gridWidth);
  gl.uniform1f(updateProgram.uniformGridHeight, gridHeight);
  gl.uniform1i(updateProgram.uniformSampler, 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  swapTextures();
}

function render() {
  //create program for reading texture and outputting the dots
  if (!renderProgram) {
    renderProgram = gl.createProgram();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `#version 300 es
      precision mediump float;

      uniform float width;
      uniform float height;
      uniform sampler2D sampler;

      in vec2 gridPos;
      out vec4 fragCol;

      void main() {
        vec2 aspectRatio = vec2(height / width, 1);
        // vec2 aspectRatio = vec2(1);
        gl_Position = vec4(texture(sampler, gridPos).rg * aspectRatio / float(${zoomOut}), 0, 1);
        gl_PointSize = float(${pointSize});
        fragCol = vec4((1.0 - gridPos.y * gridPos.y) * vec3(1, 0.04, 0.01), 1);
      }
    `);
    gl.compileShader(vertexShader);
    logIf(gl.getShaderInfoLog(vertexShader));

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `#version 300 es
      precision mediump float;

      in vec4 fragCol;
      out vec4 col;

      void main() {
        col = fragCol;
      }
    `);
    gl.compileShader(fragmentShader);
    logIf(gl.getShaderInfoLog(fragmentShader));
    
    gl.attachShader(renderProgram, vertexShader);
    gl.attachShader(renderProgram, fragmentShader);
    gl.linkProgram(renderProgram);
    logIf(gl.getProgramInfoLog(renderProgram));
    
    // create buffer of grid posses for reading every grid item
    const gridPosBuffer = gl.createBuffer();
    const gridPosBufferData = new Float32Array(gridWidth * gridHeight * 2);
    for (let x = 0; x < gridWidth; ++x) {
      for (let y = 0; y < gridHeight; ++y) {
        const index = y * gridWidth * 2 + x * 2;
        gridPosBufferData[index] = (x + 0.5) / gridWidth;
        gridPosBufferData[index + 1] = (y + 0.5) / gridHeight;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, gridPosBufferData, gl.STATIC_DRAW);

    renderProgram.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(renderProgram.vertexArray);
    const posLocation = gl.getAttribLocation(renderProgram, 'gridPos');
    gl.enableVertexAttribArray(renderProgram, posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 4 * 2, 0);
    
    renderProgram.uniformWidth = gl.getUniformLocation(renderProgram, 'width');
    renderProgram.uniformHeight = gl.getUniformLocation(renderProgram, 'height');
    renderProgram.uniformSampler = gl.getUniformLocation(renderProgram, 'sampler');
  }

  gl.useProgram(renderProgram);
  gl.bindVertexArray(renderProgram.vertexArray);
  
  // bind back to canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);

  // reset texture to be readabel
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureToRead);
  
  // set uniform values
  gl.uniform1f(renderProgram.uniformWidth, width);
  gl.uniform1f(renderProgram.uniformHeight, height);
  gl.uniform1i(gl.getUniformLocation(renderProgram, 'sampler'), 0);

  // draw dots yay
  // use additive blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.drawArrays(gl.POINTS, 0, gridWidth * gridHeight);
  gl.disable(gl.BLEND);
}



async function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
}

async function main() {
  // TODO:
  // Phases:
  // swap colours, init points, random equation
  // slowly build up time speed
  // while screen not empty
  //   run normally
  //   after 1 minute/click ramp up blow away force to max over 10/1 seconds
  // wait a bit on blank screen to give breathing room
  // repeat
  // UPDATE: Doing this in: https://glitch.com/edit/#!/resolute-road-meerkat?path=main.js:3:0
  // See https://glitch.com/edit/#!/mercurial-seen-seahorse?path=main.js:1:0 for control flow prototype.
  init();
  while (true) {
    await nextFrame();
    update();
    render();
  }
}
main();