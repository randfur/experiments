import { Tool } from './tool';

const fontImageScaleX: number = 1.28;
const fontImageScaleY: number = 0.55;

export class Stamp extends Tool {
  onMouseDown(event: MouseEvent) {
    const x = this.viewToBitmapX(this.lastMouseX);
    const y = this.viewToBitmapY(this.lastMouseY);
    this.sketchPad.bitmapContext.font = `${this.controls.fontSize}px monospace`;
    this.sketchPad.bitmapContext.fillText(
      this.controls.stampText,
      x - this.controls.fontSize * fontImageScaleX / 2,
      y + this.controls.fontSize * fontImageScaleY / 2,
    );
  }
}