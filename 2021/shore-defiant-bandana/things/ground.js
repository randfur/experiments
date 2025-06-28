import {context, width, height} from '../engine/canvas.js';

export class Ground {
  static y = height - Math.max(100, height / 4);

  static draw() {
    context.fillStyle = 'black';
    context.fillRect(0, Ground.y, width, height - Ground.y);
  }
}