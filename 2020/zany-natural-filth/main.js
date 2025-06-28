'use strict';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const gridScale = 1 / 8;
const gridWidth = Math.round(width * gridScale);
const gridHeight = Math.round(height * gridScale);
const max = 2;

let context = null;

const grid = new Float32Array(gridWidth * gridHeight * 2);
console.log(gridWidth * gridHeight);

function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  
  for (let col = 0; col < gridWidth; ++col) {
    for (let row = 0; row < gridHeight; ++row) {
      const index = row * gridWidth * 2 + col * 2;
      grid[index] = max * (2 * col / gridWidth - 1);
      grid[index + 1] = max * (2 * row / gridHeight - 1);
    }
  }
}

function xFunc(x, y) {
  return 1 / ((x * 10) + 500) + Math.cos(y) / 100;
}

function yFunc(x, y) {
  return x * (y - 1) / 100;
}

function frame() {
  context.clearRect(0, 0, width, height);

  context.fillStyle = 'white';
  for (let col = 0; col < gridWidth; ++col) {
    for (let row = 0; row < gridHeight; ++row) {
      const index = row * gridWidth * 2 + col * 2;
      const x = grid[index];
      const y = grid[index + 1];
      grid[index] += xFunc(x, y);
      grid[index + 1] += yFunc(x, y);
      // context.fillStyle = `rgb(${col / gridWidth * 255 | 0}, ${row / gridHeight * 255 | 0}, 0)`;
      context.fillRect(
        Math.round((x * gridScale + 1) * width / 2),
        Math.round((y * gridScale + 1) * height / 2),
        1, 1);
    }
  }

  requestAnimationFrame(frame);
}

function main() {
  init();
  frame();
}
main();