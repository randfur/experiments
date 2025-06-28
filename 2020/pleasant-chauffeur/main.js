'use strict';

const columns = (innerWidth / 12) | 0;
const rows = (innerHeight / 13) | 0;

const state = {
  dot: {
    position: createVector(columns / 2, rows / 2, 0),
    size: 4,
  },
  camera: {
    position: createVector(0, 0, -10),
    orientation: createComputedVector(result => {
      assignVector(1, 0, 0, result);
      let rotationVector = getTempVector();
      // assignRotationVector(0, 1, 0, TAU / 4, rotationVector);
      // rotateVector(result, rotationVector, result);
      releaseTempVectors(1);
    }),
  },
};

function updateState(timeSeconds, timeDeltaSeconds) {
  const speed = 0.2;
  state.dot.position.x += deviate(speed);
  state.dot.position.y += deviate(speed);
  state.dot.position.z += deviate(speed);
}

const buffer = new Uint8Array(rows * columns);
function renderState() {
  buffer.fill(0);
  buffer[(state.dot.position.y|0) * columns + (state.dot.position.x|0)] = 1;
}

const rowTexts = Array(rows).fill('');
function renderBuffer() {
  for (let row = 0; row < rows; ++row) {
    let rowText = '';
    for (let column = 0; column < columns; ++column) {
      rowText += (buffer[row * columns + column] ? 'O' : ' ') + ' ';
    }
    rowTexts[row] = rowText;
  }
      
  pre.textContent = rowTexts.join('\n');
}

let lastTimeSeconds = 0;
function frame(timeMilliseconds) {
  const timeSeconds = timeMilliseconds / 1000;
  updateState(timeSeconds, timeSeconds - lastTimeSeconds);
  lastTimeSeconds = timeSeconds;
  renderState();
  renderBuffer();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);