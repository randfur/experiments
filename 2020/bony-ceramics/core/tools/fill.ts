import { Tool } from './tool';

export class Fill extends Tool {
  onMouseDown(event: MouseEvent) {
    this.sketchPad.fillBitmap(
      this.sketchPad.viewToBitmapX(this.lastMouseX),
      this.sketchPad.viewToBitmapY(this.lastMouseY)
    );
  }
}