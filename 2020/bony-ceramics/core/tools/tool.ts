import { SketchPad } from '../sketchpad';

export class Tool {
  constructor(public sketchPad: SketchPad) {}
  
  get controls() { return this.sketchPad.controls; }
  get lastMouseX() { return this.sketchPad.lastMouseX; }
  get lastMouseY() { return this.sketchPad.lastMouseY; }
  get mouseIsDown() { return this.sketchPad.mouseIsDown; }
  viewToBitmapX(x: number) { return this.sketchPad.viewToBitmapX(x); }
  viewToBitmapY(y: number) { return this.sketchPad.viewToBitmapY(y); }

  onMouseDown(event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseUp(event: MouseEvent) {}
}