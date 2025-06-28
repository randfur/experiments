import {
  log,
  random,
} from './utils.js';

const width = window.innerWidth;
const height = window.innerHeight;

let context = null;

function init() {
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
}

function render() {
}

function main() {
  init();
  render();
}

main();