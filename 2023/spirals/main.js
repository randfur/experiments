import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';

const TAU = Math.PI * 2;

async function main() {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.append(canvas);

  const hexLinesContext = new HexLinesContext({
    canvas,
    pixelSize: 4,
    is3d: true,
  });


  const pointCount = 10000;
  const hexLines = hexLinesContext.createLines();
  const levels = [
    {turns: 1, radius: 2000},
    {turns: 1, radius: 0},
    {turns: 1, radius: 0},
    {turns: 1, radius: 0},
    {turns: 1, radius: 0},
  ];

  for (let i = 1; i < levels.length; ++i) {
    (async () => {
      const level = levels[i];
      while (true) {
        await sleep(Math.random() * 1000);
        const {turns, radius} = level;
        const targetTurns = Math.ceil(Math.random() * 6 ** i);
        const targetRadius = Math.random() * 2000 * 0.6 ** i;
        const steps = Math.random() * 5000;
        for (let step = 0; step <= steps; ++step) {
          await new Promise(requestAnimationFrame);
          const progress = step / steps;
          level.turns = slerp(turns, targetTurns, progress);
          level.radius = slerp(radius, targetRadius, progress);
        }
      }
    })();
  }

  let zxAngle = 0;
  let yzAngle = 0;

  while (true) {
    await new Promise(requestAnimationFrame);
    clearVec3s();
    yzAngle += 0.001;
    zxAngle -= 0.005;
    hexLines.clear();
    for (let i = 0; i <= pointCount; ++i) {
      const progress = i / pointCount;
      const position = add(
        literal(0, 0, 3000),
        rotateZx(
          rotateYz(
            nestedSpiral(
              levels,
              progress,
              literal(0, -1, 0),
              literal(1, 0, 0),
              literal(0, 0, 1),
            ),
            yzAngle,
          ),
          zxAngle,
        ),
      );
      hexLines.addPointFlat(
        vec3Buffer[position + 0],
        vec3Buffer[position + 1],
        vec3Buffer[position + 2],
        10,
        255,
        0,
        0,
        255,
      );
    }
    hexLines.addNull();
    hexLines.draw();
  }
}

function nestedSpiral(levels, progress, forward, right, up, depth=0) {
  if (depth >= levels.length) {
    return literal(0, 0, 0);
  }

  const angle = levels[depth].turns * progress * TAU;
  const radius = levels[depth].radius;
  return add(
    scale(right, Math.cos(angle) * radius),
    scale(up, Math.sin(angle) * radius),
    nestedSpiral(
      levels,
      progress,
      add(scale(up, Math.cos(angle)), scale(right, -Math.sin(angle))),
      add(scale(right, Math.cos(angle)), scale(up, Math.sin(angle))),
      scale(forward, -1),
      depth + 1,
    ),
  );
}

function sleep(n) {
  return new Promise(resolve => setTimeout(resolve, n));
}

function slerp(a, b, t) {
  return a + (b - a) * (t < 0.5 ? (2 * t ** 2) : (1 - (2 * (1 - t) ** 2)));
}

let vec3Buffer = new Float32Array(3);
let vec3Count = 0;
function getVec3() {
  if ((vec3Count + 1) * 3 >= vec3Buffer.length) {
    if (vec3Buffer.buffer.transfer) {
      vec3Buffer = new Float32Array(vec3Buffer.buffer.transfer(vec3Buffer.buffer.byteLength * 2));
    } else {
      const newVec3Buffer = new Float32Array(vec3Buffer.length * 2);
      newVec3Buffer.set(vec3Buffer);
      vec3Buffer = newVec3Buffer;
    }
  }
  return (vec3Count++) * 3;
}
function clearVec3s() {
  vec3Count = 0;
}

function debug(v) {
  return [
    v,
    vec3Buffer[v + 0],
    vec3Buffer[v + 1],
    vec3Buffer[v + 2],
  ];
}

function literal(x, y, z) {
  const result = getVec3();
  vec3Buffer[result + 0] = x;
  vec3Buffer[result + 1] = y;
  vec3Buffer[result + 2] = z;
  return result;
}

function add(...vs) {
  const result = literal(0, 0, 0);
  for (const v of vs) {
    vec3Buffer[result + 0] += vec3Buffer[v + 0];
    vec3Buffer[result + 1] += vec3Buffer[v + 1];
    vec3Buffer[result + 2] += vec3Buffer[v + 2];
  }
  return result;
}

function scale(v, k) {
  const result = getVec3();
  vec3Buffer[result + 0] = vec3Buffer[v + 0] * k;
  vec3Buffer[result + 1] = vec3Buffer[v + 1] * k;
  vec3Buffer[result + 2] = vec3Buffer[v + 2] * k;
  return result;
}

function rotateZx(v, angle) {
  const result = getVec3();
  vec3Buffer[result + 0] = vec3Buffer[v + 2] * Math.sin(angle) + vec3Buffer[v + 0] * Math.cos(angle);
  vec3Buffer[result + 1] = vec3Buffer[v + 1];
  vec3Buffer[result + 2] = vec3Buffer[v + 2] * Math.cos(angle) - vec3Buffer[v + 0] * Math.sin(angle);
  return result;
}

function rotateYz(v, angle) {
  const result = getVec3();
  vec3Buffer[result + 0] = vec3Buffer[v + 0];
  vec3Buffer[result + 1] = vec3Buffer[v + 1] * Math.cos(angle) - vec3Buffer[v + 2] * Math.sin(angle);
  vec3Buffer[result + 2] = vec3Buffer[v + 1] * Math.sin(angle) + vec3Buffer[v + 2] * Math.cos(angle);
  return result;
}

main();