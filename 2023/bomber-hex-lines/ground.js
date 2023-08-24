import {Drawing} from './drawing.js';

export class Ground {
  static trees;
  static bumps;

  static init() {
  }

  static addLines() {
    const size = 3000;
    const step = 40;
    let shift = false;
    for (let x = -size / 2; x < size / 2; x += step) {
      shift ^= true;
      for (let z = -size / 2 + (shift ? step / 2 : 0); z < size / 2; z += step * Math.sqrt(3) / 2) {
        if (x ** 2 + z ** 2 > (size / 2) ** 2) {
          continue;
        }
        const line = Drawing.addLine();
        line.start.setXyz(x, -getGroundHeight(x, z), z);
        line.end.setXyz(x, line.start.y - 1, z);
        line.width = 4;
        line.r = 255;
        line.g = 255;
        line.b = 255;
        line.a = 255;
      }
    }
  }
}

function getGroundHeight(x, y) {
  const scale = 0.02;
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