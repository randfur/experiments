import {Drawing} from './drawing.js';

export class Ground {
  static trees;
  static bumps;

  static init() {
  }

  static draw() {
  }
}

function getGroundHeight(x, y) {
  return ((
    rsin(x + 100, y + 200) +
    rsin(x + 300, y + 300) +
    rsin(x + -200, y + 700)
  ) / 3) + 0.5;
}

function rsin(x, y) {
  return Math.sin(Math.sqrt(x ** 2 + y ** 2));
}