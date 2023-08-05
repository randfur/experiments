async function main() {
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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

    const Vertex vertices[] = Vertex[31](
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
      Vertex(0., 1., 0., vec2(0.5, -sqrt3_2)),

      // For some reason the last element is garbage so leave a sacrificial one at the end.
      Vertex(0., 0., 0., vec2(0, 0))
    );

    in vec2 pos;
    in float size;
    in vec2 nextPos;
    in float nextSize;

    vec2 rotate(vec2 v, vec2 r) {
      return vec2(
        v.x * r.x - v.y * r.y,
        v.x * r.y + v.y * r.x);
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
    }
  `);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    out vec4 col;

    void main() {
      col = vec4(1, 0, 0, 1);
    }
  `);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  console.log(gl.getProgramInfoLog(program));

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const posAttrib = gl.getAttribLocation(program, 'pos');
  const sizeAttrib = gl.getAttribLocation(program, 'size');
  const nextPosAttrib = gl.getAttribLocation(program, 'nextPos');
  const nextSizeAttrib = gl.getAttribLocation(program, 'nextSize');

  gl.enableVertexAttribArray(posAttrib);
  gl.enableVertexAttribArray(sizeAttrib);
  gl.enableVertexAttribArray(nextPosAttrib);
  gl.enableVertexAttribArray(nextSizeAttrib);

  gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, gl.FALSE, 12, 0);
  gl.vertexAttribPointer(sizeAttrib, 1, gl.FLOAT, gl.FALSE, 12, 8);
  gl.vertexAttribPointer(nextPosAttrib, 2, gl.FLOAT, gl.FALSE, 12, 12);
  gl.vertexAttribPointer(nextSizeAttrib, 1, gl.FLOAT, gl.FALSE, 12, 20);

  gl.vertexAttribDivisor(posAttrib, 1);
  gl.vertexAttribDivisor(sizeAttrib, 1);
  gl.vertexAttribDivisor(nextPosAttrib, 1);
  gl.vertexAttribDivisor(nextSizeAttrib, 1);

  const strokes = [];
  for (const i of range(20)) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let size = 10 + Math.random() * 50;
    const length = 4 + Math.random(10);
    const stroke = [];
    for (const j of range(length)) {
      stroke.push(x, y, size);
      x += (Math.random() * 2 - 1) * 50;
      y += Math.random() * 100;
      size *= 0.8;
    }
    strokes.push(stroke);
  }

  for (const i of range(100)) {
    (async () => {
      while (true) {
        await sleep(Math.random() * 2000);
        const stroke = pickItem(strokes);
        const index = Math.floor(Math.floor(Math.random() * stroke.length) / 3) * 3;
        const targetX = stroke[index + 0] + (Math.random() * 2 - 1) * 50;
        const targetY = stroke[index + 1] + (Math.random() * 2 - 1) * 50;
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

    const bufferData = [
      0, 0, 0,
      ...strokes.flatMap(stroke => [
        ...stroke,
        0, 0, 0,
      ]),
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.DYNAMIC_DRAW);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, bufferData.length / 3 - 1);
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

main();
