const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const depth = 10*Math.max(width, height);
const context = canvas.getContext('2d');
const zZoom = 400;
const zNearClip = 0.01;

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function random(x) {
  return Math.random() * x;
}

function randomRange(a, b) {
  return Math.random() * (b - a) + a;
}

const boxCount = 3000;
const boxes = range(boxCount).map(_ => {
  const angle = random(TAU);
  // const radius = random(Math.max(width, height));
  const radius = (1 - Math.random() * Math.random()) * Math.min(width, height);
  const box = {
    position: [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      -random(depth / 2),
    ],

    size: 0,

    velocity: [
      0,
      0,
      -random(100),
    ],
  };
  return box;
});

function inplaceAddVec3(va, vb) {
  va[0] += vb[0];
  va[1] += vb[1];
  va[2] += vb[2];
}

function copyVec3(va, vb) {
  va[0] = vb[0];
  va[1] = vb[1];
  va[2] = vb[2];
}

function addScaledVec3(vout, va, ka, vb, kb) {
  vout[0] = va[0] * ka + vb[0] * kb;
  vout[1] = va[1] * ka + vb[1] * kb;
  vout[2] = va[2] * ka + vb[2] * kb;
}

function subtractVec3(vout, va, vb) {
  vout[0] = va[0] - vb[0];
  vout[1] = va[1] - vb[1];
  vout[2] = va[2] - vb[2];
}

const screenBoxResult = [0, 0, 0];
function boxToScreenBox(position, size=0) {
  const zDiv = position[2] / zZoom;
  screenBoxResult[0] = width / 2 + position[0] / zDiv;
  screenBoxResult[1] = height / 2 + position[1] / zDiv;
  screenBoxResult[2] = size / zDiv;
  return screenBoxResult;
}

const temp3dLineVec3 = [0, 0, 0];
const farMinusNear = [0, 0, 0];
function draw3dLine(positionA, positionB) {
  if (positionA[2] < zNearClip && positionB[2] < zNearClip) {
    return;
  }

  let nearPosition = positionA[2] < positionB[2] ? positionA : positionB;
  let farPosition = nearPosition == positionA ? positionB : positionA;
  if (nearPosition[2] < zNearClip) {
    copyVec3(temp3dLineVec3, nearPosition);
    nearPosition = temp3dLineVec3;
    
    /*
    Vectors near and far.
    near is behind, far is infront.
    P is a point on the culling plane e.g. (0, 0, 0.001), a bit forward so later we don't divide by 0 when we divide by z.
    N is the direction of "infront", a unit vector.

    Midpoint M between near and far that's on the culling plane:
    planeDistance = (P - near) . N
    farDistance = (far - near) . N
    M = near + (planeDistance / farDistance) * (far - near)
    */
    
    // TODO later: Use camera direction and camera position.
    // Currently we assume position is (0, 0, 0) and direction is (0, 0, 1).
    // P = (0, 0, zNearClip)
    const planeDistance = zNearClip - nearPosition[2]
    const farDistance = farPosition[2] - nearPosition[2];
    subtractVec3(farMinusNear, farPosition, nearPosition);
    addScaledVec3(nearPosition, nearPosition, 1, farMinusNear, planeDistance / farDistance);
  }
  const [screenNearX, screenNearY] = boxToScreenBox(nearPosition);
  const [screenFarX, screenFarY] = boxToScreenBox(farPosition);
  context.beginPath();
  context.moveTo(screenNearX, screenNearY);
  context.lineTo(screenFarX, screenFarY);
  context.stroke();
}

async function main() {
  canvas.width = width;
  canvas.height = height;

  while (true) {
    await new Promise(requestAnimationFrame);
    
    for (const box of boxes) {
      inplaceAddVec3(box.position, box.velocity);
      
      // box.velocity[0] += Math.sin(box.position[1]) - box.velocity[0] / 10;
      // box.velocity[1] += Math.sin(box.position[2]) - box.velocity[1] / 10;
      // box.velocity[2] += Math.sin(box.position[0]) - box.velocity[2] / 10;
      
      // if (box.position[0] > width / 2) { box.position[0] -= width; }
      // if (box.position[0] < -width / 2) { box.position[0] += width; }
      // if (box.position[1] > height / 2) { box.position[1] -= height; }
      // if (box.position[1] < -height / 2) { box.position[1] += height; }
      if (box.position[2] > depth / 2) { box.position[2] -= depth; }
      if (box.position[2] < -depth / 2) { box.position[2] += depth; }
    }
    
    context.clearRect(0, 0, width, height);
    const lineEnd = [0, 0, 0];
    for (const box of boxes) {
      if (box.position[2] <= 0) {
        continue;
      }
      context.fillStyle = '#0f04';
      const [screenBoxX, screenBoxY, screenBoxSize] = boxToScreenBox(box.position, box.size);
      context.fillRect(
        screenBoxX - screenBoxSize / 2,
        screenBoxY - screenBoxSize / 2,
        screenBoxSize, screenBoxSize);
      
      const lineScale = 10;
      addScaledVec3(lineEnd, box.position, 1, box.velocity, lineScale);
      const farPercent = box.position[2] / (depth / 2);
      context.strokeStyle = `rgb(255, ${255*(1-farPercent)}, 0)`;
      context.lineWidth = 3;
      draw3dLine(box.position, lineEnd);

    }
  }
}

main();