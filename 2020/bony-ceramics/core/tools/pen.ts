import { Tool } from './tool';

export class Pen extends Tool {
  onMouseDown(event: MouseEvent) {
    this.drawBitmapDot(
      this.viewToBitmapX(this.lastMouseX),
      this.viewToBitmapY(this.lastMouseY),
    );
  }

  onMouseMove(event: MouseEvent) {
    if (!this.mouseIsDown)
      return;

    this.drawBitmapLine(
      this.viewToBitmapX(this.lastMouseX),
      this.viewToBitmapY(this.lastMouseY),
      this.viewToBitmapX(event.offsetX),
      this.viewToBitmapY(event.offsetY),
    );
  }

  drawBitmapDot(x: number, y: number) {
    const lineWidth = this.controls.lineWidth;
    this.sketchPad.bitmapContext.fillRect(
      Math.round(x - lineWidth / 2),
      Math.round(y - lineWidth / 2),
      lineWidth,
      lineWidth,
    );
  }

  drawBitmapLine(x1: number, y1: number, x2: number, y2: number) {
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (Math.abs(dx) > Math.abs(dy)) {
      const slope = dy / dx;
      for (let x = x1; x != x2; x += Math.sign(dx))
        this.drawBitmapDot(x, y1 + (x - x1) * slope);
    } else {
      const slope = dx / dy;
      for (let y = y1; y != y2; y += Math.sign(dy))
        this.drawBitmapDot(x1 + (y - y1) * slope, y);
    }
  }
}