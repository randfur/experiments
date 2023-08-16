async function main() {
  const scale = 4;
  const canvas = document.getElementById('canvas');
  canvas.width = Math.floor(window.innerWidth / scale);
  canvas.height = Math.floor(window.innerHeight / scale);
  canvas.style = `
    transform-origin: top left;
    transform: scale(${scale});
    image-rendering: pixelated;
  `;
  const gl = canvas.getContext('webgl2');

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `#version 300 es
    precision mediump float;

    const float sqrt3_2 = sqrt(3.) / 2.;

    const float width = ${canvas.width}.;
    const float height = ${canvas.height}.;

    struct Vertex {
      float pos;
      float nextPos;
      float join;
      vec2 hex;
    };

    const Vertex vertices[] = Vertex[30](
      // Hex
      Vertex(1., 0., 0., vec2(-0.5, sqrt3_2)),
      Vertex(1., 0., 0., vec2(-1, 0)),
      Vertex(1., 0., 0., vec2(-0.5, -sqrt3_2)),

      Vertex(1., 0., 0., vec2(-0.5, sqrt3_2)),
      Vertex(1., 0., 0., vec2(-0.5, -sqrt3_2)),
      Vertex(1., 0., 0., vec2(0.5, sqrt3_2)),

      Vertex(1., 0., 0., vec2(0.5, sqrt3_2)),
      Vertex(1., 0., 0., vec2(0.5, -sqrt3_2)),
      Vertex(1., 0., 0., vec2(-0.5, -sqrt3_2)),

      Vertex(1., 0., 0., vec2(0.5, sqrt3_2)),
      Vertex(1., 0., 0., vec2(1, 0)),
      Vertex(1., 0., 0., vec2(0.5, -sqrt3_2)),

      // Join
      Vertex(1., 0., -1., vec2(0, 0)),
      Vertex(0., 1., -1., vec2(0, 0)),
      Vertex(0., 1., 1., vec2(0, 0)),

      Vertex(0., 1., 1., vec2(0, 0)),
      Vertex(1., 0., 1., vec2(0, 0)),
      Vertex(1., 0., -1., vec2(0, 0)),

      // Next hex
      Vertex(0., 1., 0., vec2(-0.5, sqrt3_2)),
      Vertex(0., 1., 0., vec2(-1, 0)),
      Vertex(0., 1., 0., vec2(-0.5, -sqrt3_2)),

      Vertex(0., 1., 0., vec2(-0.5, sqrt3_2)),
      Vertex(0., 1., 0., vec2(-0.5, -sqrt3_2)),
      Vertex(0., 1., 0., vec2(0.5, sqrt3_2)),

      Vertex(0., 1., 0., vec2(0.5, sqrt3_2)),
      Vertex(0., 1., 0., vec2(0.5, -sqrt3_2)),
      Vertex(0., 1., 0., vec2(-0.5, -sqrt3_2)),

      Vertex(0., 1., 0., vec2(0.5, sqrt3_2)),
      Vertex(0., 1., 0., vec2(1, 0)),
      Vertex(0., 1., 0., vec2(0.5, -sqrt3_2))
    );

    in vec2 pos;
    in float size;
    in uint colour;
    in vec2 nextPos;
    in float nextSize;
    in uint nextColour;

    out vec4 vertexOutColour;

    vec2 rotate(vec2 v, vec2 r) {
      return vec2(
        v.x * r.x - v.y * r.y,
        v.x * r.y + v.y * r.x);
    }

    vec4 u32ToRgba(uint rgba) {
      return vec4(
        float(rgba >> 24) / 255.,
        float((rgba >> 16) & 0xffu) / 255.,
        float((rgba >> 8) & 0xffu) / 255.,
        float(rgba & 0xffu) / 255.);
    }

    void main() {
      Vertex vertex = vertices[gl_VertexID];
      float hexRadius = vertex.pos * size + vertex.nextPos * nextSize;
      vec2 vertexRotation = normalize(rotate(nextPos - pos, vec2(0, 1)));
      vec2 screenPos =
        (
          vertex.pos * pos  +
          vertex.nextPos * nextPos  +
          vertex.join * vertexRotation * hexRadius +
          rotate(vertex.hex, vertexRotation) * hexRadius
        ) * float(size > 0. && (gl_VertexID < 12 || nextSize > 0.));
      gl_Position = vec4(
        screenPos.x * 2. / width - 1.,
        1. - screenPos.y * 2. / height,
        0, 1);
      vertexOutColour = vertex.pos * u32ToRgba(colour) + vertex.nextPos * u32ToRgba(nextColour);
    }
  `);
  gl.compileShader(vertexShader);
  logIf(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    in vec4 vertexOutColour;
    out vec4 fragmentOutColour;

    void main() {
      fragmentOutColour = vertexOutColour;
    }
  `);
  gl.compileShader(fragmentShader);
  logIf(gl.getShaderInfoLog(fragmentShader));

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  logIf(gl.getProgramInfoLog(program));

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const posAttrib = gl.getAttribLocation(program, 'pos');
  const sizeAttrib = gl.getAttribLocation(program, 'size');
  const colourAttrib = gl.getAttribLocation(program, 'colour');
  const nextPosAttrib = gl.getAttribLocation(program, 'nextPos');
  const nextSizeAttrib = gl.getAttribLocation(program, 'nextSize');
  const nextColourAttrib = gl.getAttribLocation(program, 'nextColour');

  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(sizeAttrib);
  gl.enableVertexAttribArray(colourAttrib);
  gl.enableVertexAttribArray(nextPosAttrib);
  gl.enableVertexAttribArray(nextSizeAttrib);
  gl.enableVertexAttribArray(nextColourAttrib);

  gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, gl.FALSE, 4 * 4, 0 * 4);
  gl.vertexAttribPointer(sizeAttrib, 1, gl.FLOAT, gl.FALSE, 4 * 4, 2 * 4);
  gl.vertexAttribIPointer(colourAttrib, 1, gl.UNSIGNED_INT, 4 * 4, 3 * 4);
  gl.vertexAttribPointer(nextPosAttrib, 2, gl.FLOAT, gl.FALSE, 4 * 4, 4 * 4);
  gl.vertexAttribPointer(nextSizeAttrib, 1, gl.FLOAT, gl.FALSE, 4 * 4, 6 * 4);
  gl.vertexAttribIPointer(nextColourAttrib, 1, gl.UNSIGNED_INT, 4 * 4, 7 * 4);

  gl.vertexAttribDivisor(posAttrib, 1);
  gl.vertexAttribDivisor(sizeAttrib, 1);
  gl.vertexAttribDivisor(colourAttrib, 1);
  gl.vertexAttribDivisor(nextPosAttrib, 1);
  gl.vertexAttribDivisor(nextSizeAttrib, 1);
  gl.vertexAttribDivisor(nextColourAttrib, 1);

  const strokes = [];
  for (const i of range(200)) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let size = 5 + Math.random() * 10;
    let r = Math.random() * 256;
    let g = 0;
    let b = 0;
    const length = 4 + Math.random(10);
    const stroke = [];
    for (const j of range(length)) {
      stroke.push(x, y, size, u32ToF32(rgbaToU32(r, g, b, 255)));
      x += (Math.random() * 2 - 1) * 10;
      y += Math.random() * 25;
      size *= 0.8;
      if (j < length - 1) {
        r *= 0.8;
        g *= 0.8;
        b *= 0.8;
      }
    }
    strokes.push(stroke);
  }

  for (const i of range(strokes.length)) {
    (async () => {
      while (true) {
        await sleep(Math.random() * 2000);
        const stroke = pickItem(strokes);
        const index = Math.floor(Math.floor(Math.random() * stroke.length) / 4) * 4;
        const targetX = stroke[index + 0] + (Math.random() * 2 - 1) * 10;
        const targetY = stroke[index + 1] + (Math.random() * 2 - 1) * 10;
        const factor = Math.random() * 0.1;
        const frames = 50 + Math.random() * 100;
        for (const i of range(frames)) {
          await new Promise(requestAnimationFrame);
          stroke[index + 0] += (targetX - stroke[index + 0]) * factor * i / frames;
          stroke[index + 1] += (targetY - stroke[index + 1]) * factor * i / frames;
        }
      }
    })();
  }

  while (true) {
    await new Promise(requestAnimationFrame);

    const float32Buffer = new Float32Array([
      0, 0, 0, 0,
      ...strokes.flatMap(stroke => [
        ...stroke,
        0, 0, 0, 0,
      ]),
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, float32Buffer, gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, float32Buffer.length / 4 - 1);
  }
}

function logIf(text) {
  if (text !== '') {
    console.log(text);
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function pickItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sleep(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
}

function rgbaToU32(r, g, b, a) {
  return ((r & 0xff) << 24) + ((g & 0xff) << 16) + ((b & 0xff) << 8) + (a & 0xff);
}

const conversionBuffer = new ArrayBuffer(4);
const conversionView = new DataView(conversionBuffer);
function u32ToF32(x) {
  conversionView.setUint32(0, x);
  return conversionView.getFloat32(0);
}

main();
