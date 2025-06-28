import {Screen} from '../ui/Screen';

export class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;

  constructor({x, y, width, height}: {x: number, y: number, width: number, height: number}) {
    Object.assign(this, {
      x,
      y,
      width,
      height,
      canvas: new OffscreenCanvas(width, height),
    });
    this.context = this.canvas.getContext('2d')!;
  }
  
  draw() {
    const {x, y, width, height} = this;
    Screen.context!.strokeRect(x + 0.5, y + 0.5, width, height);
  }
}