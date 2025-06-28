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

function assert(condition, message='Failed assert') {
  if (!condition) {
    throw new Error(message);
  }
}

function toInteger(text) {
  const result = parseInt(text);
  assert(!isNaN(result), 'Not a number');
  return result;
}

function createPipeline({gl, shaders}) {
  const program = gl.createProgram();
  for (const [type, code] of Object.entries(shaders)) {
    const shader = gl.createShader(gl[type.toUpperCase() + '_SHADER']);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    logIf(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);
  logIf(gl.getProgramInfoLog(program, gl.LINK_STATUS));

  gl.validateProgram(program);
  logIf(gl.getProgramInfoLog(program, gl.VERIFY_STATUS));

  let offset = 0;
  const attributes = {};
  for (const code of Object.values(shaders)) {
    for (const [_, vecSize, name] of code.matchAll(/attribute\svec(\d)\s(\w+)/g)) {
      const size = toInteger(vecSize);
      attributes[name] = {
        size,
        offset,
        shaderLocation: gl.getAttribLocation(program, name),
      };
      offset += size;
    }
  }
  
  return {
    gl,
    program,
    arrayBuffer: gl.createBuffer(),
    arrayData: null,
    elementArrayBuffer: gl.createBuffer(),
    elementArrayData: null,
    vertexLayout: {
      size: offset,
      attributes,
    },
  };
}

function renderScene(scene, pipeline) {
  pipeline.gl.useProgram(pipeline.program);

  pipeline.gl.bindBuffer(pipeline.gl.ARRAY_BUFFER, pipeline.arrayBuffer);
  if (!pipeline.arrayData || pipeline.arrayData.length < scene.vertices.length * pipeline.vertexLayout.size) {
    pipeline.arrayData = new Float32Array(scene.vertices.length * pipeline.vertexLayout.size);
  }
  for (const [index, vertex] of Object.entries(scene.vertices)) {
    for (const [name, values] of Object.entries(vertex)) {
      assert(pipeline.vertexLayout.attributes[name].size == values.length);
      pipeline.arrayData.set(values, index * pipeline.vertexLayout.size + pipeline.vertexLayout.attributes[name].offset)
    }
  }
  pipeline.gl.bufferData(pipeline.gl.ARRAY_BUFFER, pipeline.arrayData, pipeline.gl.STATIC_DRAW);

  for (const [name, {size, offset, shaderLocation}] of Object.entries(pipeline.vertexLayout.attributes)) {
    pipeline.gl.enableVertexAttribArray(shaderLocation);
    pipeline.gl.vertexAttribPointer(
        shaderLocation,
        size,
        pipeline.gl.FLOAT,
        pipeline.gl.FALSE,
        pipeline.vertexLayout.size * Float32Array.BYTES_PER_ELEMENT,
        offset * Float32Array.BYTES_PER_ELEMENT);
  }
  
  pipeline.gl.bindBuffer(pipeline.gl.ELEMENT_ARRAY_BUFFER, pipeline.elementArrayBuffer);
  if (!pipeline.elementArrayData || pipeline.elementArrayData.length < scene.triangles) {
    pipeline.elementArrayData = new Uint8Array(scene.triangles.length);
  }
  pipeline.elementArrayData.set(scene.triangles);
  pipeline.gl.bufferData(pipeline.gl.ELEMENT_ARRAY_BUFFER, pipeline.elementArrayData, pipeline.gl.STATIC_DRAW);

  pipeline.gl.drawElements(pipeline.gl.TRIANGLES, scene.triangles.length, pipeline.gl.UNSIGNED_BYTE, 0);
}

const pipeline = createPipeline({
  gl: canvas.getContext('webgl'),
  shaders: {
    vertex: `
      precision mediump float;
      attribute vec2 pos;
      attribute vec3 col;
      varying vec3 fragCol;
      void main() {
        fragCol = col;
        gl_Position = vec4(pos, 0, 1);
      }
    `,
    fragment: `
      precision mediump float;
      varying vec3 fragCol;
      void main() {
        gl_FragColor = vec4(fragCol, 1);
      }
    `,
  },
});

const scene = {
  vertices: [
    { pos: [-0.5, -0.5], col: [1, 0.3, 0.2] },
    { pos: [ 0.0,  0.5], col: [0.1, 1, 0.2] },
    { pos: [ 0.5, -0.5], col: [0.1, 0.1, 1] },
  ],
  triangles: [0, 1, 2],
};

renderScene(scene, pipeline);