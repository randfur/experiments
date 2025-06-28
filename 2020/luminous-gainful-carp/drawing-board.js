import { kLeftButton } from './utils.js';
import { drawLine } from './drawing.js';

export class DrawingBoard {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = new OffscreenCanvas(this.width, this.height);
    this.context = this.canvas.getContext('2d');
    this.imageData = new ImageData(this.width, this.height);
    this.tool = 'pen';
    this.dragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
  }
  
  clear() {
    this.imageData.data.fill(0);
  }
  
  stopAction() {
    this.dragging = false;
  }
  
  handleMouseDown(event) {
    if (event.button == kLeftButton) {
      this.dragging = true;
    }
    this.lastMouseX = event.offsetX;
    this.lastMouseY = event.offsetY;
  }
  
  handleMouseMove(event) {
    if (this.dragging) {
      drawLine(
        this.imageData,
        this.lastMouseX, this.lastMouseY,
        event.offsetX, event.offsetY,
        3,
      );
    }    
    this.lastMouseX = event.offsetX;
    this.lastMouseY = event.offsetY;
  }
  
  handleMouseUp(event) {
    if (event.button == kLeftButton) {
      this.stopAction();
    }
  }
  
  draw(context) {
    this.context.putImageData(this.imageData, 0, 0);
    context.drawImage(this.canvas, 0, 0);
  }
}