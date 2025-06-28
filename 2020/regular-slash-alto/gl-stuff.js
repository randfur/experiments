import {debugPrint} from './utils.js';

let framebuffer = null;
let quadBuffer = null;

function logIf(text) {
  if (text) {
    console.log(text);
    debugPrint(text);
  }
}

export function initGL(gl, gridWidth, gridHeight) {
  window.gl = gl;

  gl.getExtension('EXT_color_buffer_float');
  
  framebuffer = gl.createFramebuffer();
  
  quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 1,
    -1, 1,
    -1, -1,
    -1, -1,
    1, -1,
    1, 1,
  ]), gl.STATIC_DRAW);
}

export function createGrid(gl, width, height) {
  const grid = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, grid);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, width, height, 0, gl.RG, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  grid.width = width;
  grid.height = height;
  return grid;
}

let resetProgram = null;
export function resetGrid(gl, grid) {
  if (!resetProgram) {
    resetProgram = gl.createProgram();
    
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
      
      uniform float width;
      uniform float height;

      out vec4 col;
      
      void main() {
        vec2 halfSize = vec2(width, height) / 2.0;
        vec2 aspectRatio = vec2(width, height) / min(width, height);
        vec2 pos = (gl_FragCoord.xy - halfSize) / halfSize * aspectRatio;
        col = vec4(pos, 0, 1);
      }
    `);
    gl.compileShader(fragmentShader);
    logIf(gl.getShaderInfoLog(fragmentShader));

    gl.attachShader(resetProgram, vertexShader);
    gl.attachShader(resetProgram, fragmentShader);
    gl.linkProgram(resetProgram);
    logIf(gl.getProgramInfoLog(resetProgram));
    
    resetProgram.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(resetProgram.vertexArray);

    const posLocation = gl.getAttribLocation(resetProgram, 'pos');
    gl.enableVertexAttribArray(resetProgram, posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);
    
    resetProgram.uniformWidth = gl.getUniformLocation(resetProgram, 'width');
    resetProgram.uniformHeight = gl.getUniformLocation(resetProgram, 'height');
  }
  gl.useProgram(resetProgram);
  gl.bindVertexArray(resetProgram.vertexArray);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.bindTexture(gl.TEXTURE_2D, grid);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, grid, 0);
  gl.viewport(0, 0, grid.width, grid.height);

  gl.uniform1f(resetProgram.uniformWidth, grid.width);
  gl.uniform1f(resetProgram.uniformHeight, grid.height);
  
  gl.disable(gl.BLEND);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

let updateProgram = null;
export function updateGrid(gl, gridSource, gridDestination, time, forceFactor, pushAwayFactor, pushAwayFromX, pushAwayFromY) {
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
      uniform float forceFactor;
      uniform float pushAwayFactor;
      uniform vec2 pushAwayFrom;
      uniform vec2 size;
      uniform sampler2D sampler;

      out vec4 col;

      void main() {
        vec2 pos = texture(sampler, gl_FragCoord.xy / size).rg;
        float x = pos.x;
        float y = pos.y;
        pos += forceFactor * vec2(
          y * 1.0 * (x  * 4.0 - sin(time / 1250.0) * 0.5) / 100.0,
          1.0 / (y * 2.0 + 4000.0) + cos(x * 8.0 * 2.0 / (1.0 + 2.0 * y * y)) / 100.0
        );
        pos += pushAwayFactor * (pos - pushAwayFrom) / (0.01 + distance(pos, pushAwayFrom));
        col = vec4(pos, 0, 1);
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
    
    const posLocation = gl.getAttribLocation(updateProgram, 'pos');
    gl.enableVertexAttribArray(updateProgram, posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);
    
    updateProgram.uniformTime = gl.getUniformLocation(updateProgram, 'time');
    updateProgram.uniformForceFactor = gl.getUniformLocation(updateProgram, 'forceFactor');
    updateProgram.uniformPushAwayFactor = gl.getUniformLocation(updateProgram, 'pushAwayFactor');
    updateProgram.uniformPushAwayFrom = gl.getUniformLocation(updateProgram, 'pushAwayFrom');
    updateProgram.uniformSize = gl.getUniformLocation(updateProgram, 'size');
    updateProgram.uniformSampler = gl.getUniformLocation(updateProgram, 'sampler');
  }
  gl.useProgram(updateProgram);
  gl.bindVertexArray(updateProgram.vertexArray);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gridSource);
  
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, gridDestination);
  gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gridDestination, 0);
  gl.viewport(0, 0, gridDestination.width, gridDestination.height);
  
  gl.uniform1f(updateProgram.uniformTime, time);
  gl.uniform1f(updateProgram.uniformForceFactor, forceFactor);
  gl.uniform1f(updateProgram.uniformPushAwayFactor, pushAwayFactor);
  gl.uniform2f(updateProgram.uniformPushAwayFrom, pushAwayFromX, pushAwayFromY);
  gl.uniform2f(updateProgram.uniformSize, gridDestination.width, gridDestination.height);
  gl.uniform1i(updateProgram.uniformSampler, 0);
  
  gl.disable(gl.BLEND);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

let pixelArray = null;
export function allPointsOutOfBounds(gl, grid) {
  if (!pixelArray) {
    pixelArray = new Float32Array(grid.width * grid.height * 2);
  }
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer);
  gl.bindTexture(gl.TEXTURE_2D, grid);
  gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, grid, 0);
  gl.readPixels(0, 0, grid.width, grid.height, gl.RG, gl.FLOAT, pixelArray);
  const xLimit = (grid.width + 1) / Math.min(grid.width, grid.height);
  const yLimit = (grid.height + 1) / Math.min(grid.width, grid.height);
  for (let y = 0; y < grid.height; ++y) {
    for (let x = 0; x < grid.width; ++x) {
      const index = (y * grid.width + x) * 2;
      if (Math.abs(pixelArray[index]) <= xLimit && Math.abs(pixelArray[index + 1]) <= yLimit) {
        return false;
      }
    }
  }
  return true;
}

let renderBackProgram = null;
let renderFrontProgram = null;
export function renderGrid(gl, grid, pointSize, colours, width, height) {
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  if (!colours.lightOnDark) {
    if (!renderBackProgram) {
      renderBackProgram = gl.createProgram();

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

        uniform float height;
        uniform vec3 col;

        out vec4 outCol;

        void main() {
          outCol = vec4(col * (1.0 - pow(gl_FragCoord.y / height, 2.0)), 1);
        }
      `);
      gl.compileShader(fragmentShader);
      logIf(gl.getShaderInfoLog(fragmentShader));

      gl.attachShader(renderBackProgram, vertexShader);
      gl.attachShader(renderBackProgram, fragmentShader);
      gl.linkProgram(renderBackProgram);
      logIf(gl.getProgramInfoLog(renderBackProgram));

      renderBackProgram.vertexArray = gl.createVertexArray();
      gl.bindVertexArray(renderBackProgram.vertexArray);

      const posLocation = gl.getAttribLocation(renderBackProgram, 'pos');
      gl.enableVertexAttribArray(renderBackProgram, posLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);

      renderBackProgram.uniformHeight = gl.getUniformLocation(renderBackProgram, 'height');
      renderBackProgram.uniformCol = gl.getUniformLocation(renderBackProgram, 'col');
    }
    gl.useProgram(renderBackProgram);
    gl.bindVertexArray(renderBackProgram.vertexArray);

    gl.uniform1f(renderBackProgram.uniformHeight, height);
    gl.uniform3fv(renderBackProgram.uniformCol, colours.back);

    gl.disable(gl.BLEND);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  if (!renderFrontProgram) {
    renderFrontProgram = gl.createProgram();
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `#version 300 es
      precision mediump float;

      uniform float width;
      uniform float height;
      uniform sampler2D sampler;
      uniform float pointSize;
      uniform vec3 col;

      in vec2 pos;
      out vec3 fragCol;

      void main() {
        gl_Position = vec4(texture(sampler, (pos + vec2(0.5)) / vec2(width, height)).rg * min(width, height) / vec2(width, height), 0, 1);
        gl_PointSize = pointSize;
        fragCol = col * (1.0 - pow(pos.y / height, 2.0));
      }
    `);
    gl.compileShader(vertexShader);
    logIf(gl.getShaderInfoLog(vertexShader));
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `#version 300 es
      precision mediump float;

      in vec3 fragCol;
      out vec4 col;

      void main() {
        col = vec4(fragCol, 1);
      }
    `);
    gl.compileShader(fragmentShader);
    logIf(gl.getShaderInfoLog(fragmentShader));
    
    gl.attachShader(renderFrontProgram, vertexShader);
    gl.attachShader(renderFrontProgram, fragmentShader);
    gl.linkProgram(renderFrontProgram);
    logIf(gl.getProgramInfoLog(renderFrontProgram));
    
    renderFrontProgram.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(renderFrontProgram.vertexArray);
    
    const pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    const pointsBufferData = new Float32Array(grid.width * grid.height * 2);
    for (let x = 0; x < grid.width; ++x) {
      for (let y = 0; y < grid.height; ++y) {
        const index = y * grid.width * 2 + x * 2;
        pointsBufferData[index] = x;
        pointsBufferData[index + 1] = y;
      }
    }
    gl.bufferData(gl.ARRAY_BUFFER, pointsBufferData, gl.STATIC_DRAW);

    const posLocation = gl.getAttribLocation(renderFrontProgram, 'pos');
    gl.enableVertexAttribArray(renderFrontProgram, posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);
    
    renderFrontProgram.uniformWidth = gl.getUniformLocation(renderFrontProgram, 'width');
    renderFrontProgram.uniformHeight = gl.getUniformLocation(renderFrontProgram, 'height');
    renderFrontProgram.uniformSampler = gl.getUniformLocation(renderFrontProgram, 'sampler');
    renderFrontProgram.uniformPointSize = gl.getUniformLocation(renderFrontProgram, 'pointSize');
    renderFrontProgram.uniformCol = gl.getUniformLocation(renderFrontProgram, 'col');
  }
  gl.useProgram(renderFrontProgram);
  gl.bindVertexArray(renderFrontProgram.vertexArray);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, grid);
  
  gl.uniform1f(renderFrontProgram.uniformWidth, grid.width);
  gl.uniform1f(renderFrontProgram.uniformHeight, grid.height);
  gl.uniform1i(renderFrontProgram.uniformSampler, 0);
  gl.uniform1f(renderFrontProgram.uniformPointSize, pointSize);
  gl.uniform3fv(renderFrontProgram.uniformCol, colours.front);
  
  if (colours.lightOnDark) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
  } else {
    gl.disable(gl.BLEND);
  }

  gl.drawArrays(gl.POINTS, 0, grid.width * grid.height);
}

