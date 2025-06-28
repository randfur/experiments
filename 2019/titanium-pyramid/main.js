import {Matrix} from './matrix.js';
import {assertTrue, TAU} from './utils.js';

const canvas = document.getElementById('canvas');
const width = innerWidth;
const height = innerHeight;
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');

const circleRadius = 3;
const cameraZ = -500;
const perspective = 1 / 400;
let cameraXAngle = TAU * -0.1;
let cameraYAngle = 0;
let cameraYAngleExtra = 0;

let arrowHeadLength = 20;
let arrowHeadWidth = 10;

function moveTo(x, y, z) {
  context.moveTo(
    width / 2 + x / (z * perspective),
    height / 2 - y / (z * perspective)
  );
}

function lineTo(x, y, z) {
  context.lineTo(
    width / 2 + x / (z * perspective),
    height / 2 - y / (z * perspective)
  );
}

function circle(x, y, z, radius) {
  context.arc(
    width / 2 + x / (z * perspective),
    height / 2 - y / (z * perspective),
    radius,
    0, TAU
  );
}

function drawLines(lines, colour) {
  const rotation = Matrix.createRotateX(cameraXAngle).multiply(
    Matrix.createRotateY(cameraYAngle + cameraYAngleExtra));
  for (const line of lines) {
    assertTrue(line.length == 2);
    const start = rotation.multiply(line[0]);
    const end = rotation.multiply(line[1]);

    let x1 = start.lol[0][0];
    let y1 = start.lol[1][0];
    let z1 = start.lol[2][0] - cameraZ;

    let x2 = end.lol[0][0];
    let y2 = end.lol[1][0];
    let z2 = end.lol[2][0] - cameraZ;

    let xDir = x2 - x1;
    let yDir = y2 - y1;
    let zDir = z2 - z1;
    let length = Math.sqrt(xDir ** 2 + yDir ** 2 + zDir ** 2);
    xDir /= length;
    yDir /= length;
    zDir /= length;

    let xPerpDir = xDir;
    let yPerpDir = zDir;
    let zPerpDir = -yDir;

    const startIsBehind = z1 <= 0;
    const endIsBehind = z2 <= 0;
    if (startIsBehind && endIsBehind) {
      continue;
    }
    if (startIsBehind) {
      const t = -z1 / (z2 - z1);
      x1 = x1 + (x2 - x1) * t;
      y1 = y1 + (y2 - y1) * t;
    } else if (endIsBehind) {
      const t = -z1 / (z2 - z1);
      x2 = x1 + (x2 - x1) * t;
      y2 = y1 + (y2 - y1) * t;
    }
    
    context.beginPath();
    context.strokeStyle = colour;
    moveTo(x1 + circleRadius, y1, z1);
    circle(x1, y1, z1, circleRadius);
    moveTo(x1, y1, z1);
    lineTo(x2, y2, z2);
    context.stroke();
    if (!endIsBehind) {
      context.strokeStyle = 'white';
      context.beginPath();
      // start + dir*(length-arrowHeadLength) + perpDir*arrowHeadWidth
      const subLength = length - arrowHeadLength;
      const arrowHeadAX = x1 + xDir * subLength + xPerpDir * arrowHeadWidth;
      const arrowHeadAY = y1 + yDir * subLength + yPerpDir * arrowHeadWidth;
      const arrowHeadAZ = z1 + zDir * subLength + zPerpDir * arrowHeadWidth;
      const arrowHeadBX = x1 + xDir * subLength - xPerpDir * arrowHeadWidth;
      const arrowHeadBY = y1 + yDir * subLength - yPerpDir * arrowHeadWidth;
      const arrowHeadBZ = z1 + zDir * subLength - zPerpDir * arrowHeadWidth;
      moveTo(arrowHeadAX, arrowHeadAY, arrowHeadAZ);
      lineTo(x2, y2, z2);
      lineTo(arrowHeadBX, arrowHeadBY, arrowHeadBZ);
      context.stroke();
    }
  }
}

const axisSize = 100;
const axisLines = [
  [
    new Matrix([[-axisSize], [0],[0]]),
    new Matrix([[axisSize], [0], [0]]),
  ],
  [
    new Matrix([[0], [-axisSize], [0]]),
    new Matrix([[0], [axisSize], [0]]),
  ],
  [
    new Matrix([[0], [0], [-axisSize]]),
    new Matrix([[0], [0], [axisSize]]),
  ],
];


function createGridDrawer({size, step, matrix, gridColour, extraLines, extraLinesColour}) {
  const grid = [];
  for (let x = -size; x <= size; x += step) {
    for (let y = -size; y <= size; y += step) {
      for (let z = -size; z <= size; z += step) {
        const vector = new Matrix([[x], [y], [z]]);
        const line = [
          vector,
          matrix.multiply(vector),
        ];
        grid.push(line);
      }
    }
  }
  return function drawGrid() {
    context.lineWidth = 1;
    drawLines(grid, gridColour);

    if (extraLines) {
      context.lineWidth = 2;
      drawLines(extraLines, extraLinesColour);
    }
  };
}

function deviate(x) {
  return x * (Math.random() * 2 - 1);
}

const aSize = 200;
const gridDrawers = [
  createGridDrawer({
    gridColour: 'lime',
    size: aSize,
    step: 100,
    matrix: new Matrix([
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
    ]),
    extraLinesColour: 'red',
    extraLines: [
      [
        new Matrix([[-aSize], [-aSize], [-aSize]]),
        new Matrix([[aSize], [aSize], [aSize]]),
      ]
    ],
  }),

  // createGridDrawer({
  //   gridColour: 'lime',
  //   size: 200,
  //   step: 100,
  //   matrix: new Matrix([
  //     [deviate(1), deviate(1), deviate(1)],
  //     [deviate(1), deviate(1), deviate(1)],
  //     [deviate(1), deviate(1), deviate(1)],
  //   ]),
  // }),
];

window.addEventListener('pointermove', ({clientX, clientY}) => {
  cameraXAngle = 2 * (clientY - height / 2) / height;
  cameraYAngle = 4 * (clientX - width / 2) / width;
});

function frame(time) {
  context.clearRect(0, 0, width, height);

  cameraYAngleExtra = time / 1000;
  
  for (const gridDrawer of gridDrawers) {
    gridDrawer();
  }

  context.lineWidth = 2;
  drawLines(axisLines, 'white');

  requestAnimationFrame(frame);
}
frame(0);