import {Drawing} from './drawing.js';

export class Ground {
  static trees;
  static bumps;

  static init() {
  }

  static addLines() {
    const size = 2000;
    const step = 20;
    for (let x = -size / 2; x < size / 2; x += step) {
      for (let z = -size / 2; z < size / 2; z += step) {
        const line = Drawing.addLine();
        line.start.setXyz(x, 0, z);
        line.end.setXyz(x, -getGroundHeight(x, z), z);
        line.width = 1;
        line.colour = 'white';
      }
    }
  }
}

function getGroundHeight(x, y) {
  const scale = 0.05;
  x *= scale;
  y *= scale;
  return (((
    rsin(x + 100, y + 200) +
    rsin(x + 300, y + 300) +
    rsin(x + -200, y + 700)
  ) / 3) + 0.5) * 15;
}

function rsin(x, y) {
  return Math.sin(Math.sqrt(x ** 2 + y ** 2));
}