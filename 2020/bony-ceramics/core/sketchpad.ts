import { minimapWidth } from '../ui/config';
import { nextFrame, lerp } from './utils';
import { Controls } from './controls';
import { ToolType, tools } from './tools/tools'
import { Tool } from './tools/tool'

export class SketchPad {
  viewCanvas: HTMLCanvasElement;
  viewContext: CanvasRenderingContext2D;

  bitmapCanvas: HTMLCanvasElement;
  bitmapContext: CanvasRenderingContext2D;
  bitmapX: number = 0;
  bitmapY: number = 0;
  bitmapZoom: number = 1;

  minimapCanvas: HTMLCanvasElement;
  minimapContext: CanvasRenderingContext2D;

  getControls: () => Controls;
  lastToolType: ToolType = null;
  activeTool: Tool;
  
  updateUi: () => void;

  lastMouseX: number = 0;
  lastMouseY: number = 0;
  mouseIsDown: boolean = false;

  constructor({
    viewCanvas,
    minimapCanvas,
    getControls,
    updateUi,
  }: {
    viewCanvas: HTMLCanvasElement,
    minimapCanvas: HTMLCanvasElement,
    getControls: () => Controls,
    updateUi: () => void,
  }) {
    this.viewCanvas = viewCanvas;
    this.viewCanvas.style.width = '100%';
    this.viewCanvas.style.height = '100%';
    this.viewCanvas.width = this.viewCanvas.offsetWidth;
    this.viewCanvas.height = this.viewCanvas.offsetHeight;
    this.viewCanvas.style.width = '';
    this.viewCanvas.style.height = '';
    this.viewContext = this.viewCanvas.getContext('2d');

    this.bitmapCanvas = document.createElement('canvas');
    this.bitmapCanvas.width = 640;
    this.bitmapCanvas.height = 480;
    this.bitmapContext = this.bitmapCanvas.getContext('2d');
    this.bitmapX = Math.round((this.viewWidth - this.bitmapWidth) / 2);
    this.bitmapY = Math.round((this.viewHeight - this.bitmapHeight) / 2);
    
    this.minimapCanvas = minimapCanvas;
    this.minimapCanvas.width = minimapWidth;
    this.minimapCanvas.height = minimapWidth * this.bitmapHeight / this.bitmapWidth;
    this.minimapContext = this.minimapCanvas.getContext('2d');

    this.viewCanvas.addEventListener('mousedown', event => this.onMouseDown(event));
    this.viewCanvas.addEventListener('mousemove', event => this.onMouseMove(event));
    this.viewCanvas.addEventListener('mouseup', event => this.onMouseUp(event));
    this.viewCanvas.addEventListener('wheel', event => this.onWheel(event));

    window.addEventListener('keydown', event => this.onKeyDown(event));
    
    this.getControls = getControls;
    this.ensureToolTypeActive();
    
    this.updateUi = updateUi;
    
    this.runLoop();
  }

  get controls() {
    return this.getControls();
  }

  ensureToolTypeActive() {
    if (this.lastToolType != this.controls.toolType) {
      this.lastToolType = this.controls.toolType;
      this.activeTool = new tools[this.lastToolType](this);
    }
  }

  onMouseDown(event: MouseEvent) {
    this.mouseIsDown = true;
    this.activeTool.onMouseDown(event);
  }

  onMouseUp(event: MouseEvent) {
    this.mouseIsDown = false;
    this.activeTool.onMouseUp(event);
  }

  onWheel(event: WheelEvent) {
    const lastZoom = this.bitmapZoom;
    const minZoom = 0.75 * Math.min(
      1,
      this.viewWidth / this.bitmapWidth,
      this.viewHeight / this.bitmapHeight,
    );
    this.bitmapZoom = Math.max(minZoom, this.bitmapZoom * Math.pow(2, -Math.sign(event.deltaY) * 0.1));
    const zoomAmount = this.bitmapZoom / lastZoom;
    
      // Maintain bitmap position under mouse when zooming/zoomed in.
      let x = this.viewToBitmapX(this.lastMouseX);
      let y = this.viewToBitmapY(this.lastMouseY);

      // Apply zoom to it.
      x *= zoomAmount;
      y *= zoomAmount;

      // Put back into view coordinates.
      // Get the difference and translate bitmap by that much.
      this.bitmapX -= this.bitmapToViewX(x) - this.lastMouseX;
      this.bitmapY -= this.bitmapToViewY(y) - this.lastMouseY;

    if (zoomAmount < 1 && this.bitmapZoom < 1) {
      const targetX = (this.viewWidth - this.bitmapWidth * this.bitmapZoom) / 2;
      const targetY = (this.viewHeight - this.bitmapHeight * this.bitmapZoom) / 2;
      const progress = lastZoom != minZoom ? (this.bitmapZoom - lastZoom) / (minZoom - lastZoom) : 1;
      this.bitmapX = lerp(this.bitmapX, targetX, progress);
      this.bitmapY = lerp(this.bitmapY, targetY, progress);
    }
    
    this.viewContext.imageSmoothingEnabled = this.bitmapZoom < 1;
  }

  onMouseMove(event: MouseEvent) {
    this.activeTool.onMouseMove(event);
    this.lastMouseX = event.offsetX;
    this.lastMouseY = event.offsetY;
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'Digit1':
        this.controls.toolType = ToolType.Pen;
        break;
      case 'Digit2':
        this.controls.toolType = ToolType.Stamp;
        break;
      case 'Digit3':
        this.controls.toolType = ToolType.Fill;
        break;
      case 'Delete':
        this.bitmapContext.clearRect(0, 0, this.bitmapWidth, this.bitmapHeight);
        break;
      default:
        return;
    }
    this.updateUi();
  }

  get viewWidth() {
    return this.viewCanvas.width;
  }

  get viewHeight() {
    return this.viewCanvas.height;
  }

  get bitmapWidth() {
    return this.bitmapCanvas.width;
  }

  get bitmapHeight() {
    return this.bitmapCanvas.height;
  }

  async fillBitmap(startX: number, startY: number) {
    const width = this.bitmapWidth;
    const height = this.bitmapHeight;
    const imageData = this.bitmapContext.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    function encodeBitmapXY(x: number, y: number) {
      return (x + 1) + (y + 1) * (width + 2);
    }
    const queue = [encodeBitmapXY(Math.round(startX), Math.round(startY))];
    while (queue.length > 0) {
      const next = queue.pop();
      const x = next % (width + 2) - 1;
      const y = Math.floor(next / (width + 2)) - 1;
      if (x < 0 || x >= width || y < 0 || y >= height)
        continue;
      if (pixels[4 * (x + y * width) + 3] != 0)
        continue;
      pixels[4 * (x + y * width) + 3] = 255;
      queue.push(
        encodeBitmapXY(x - 1, y),
        encodeBitmapXY(x + 1, y),
        encodeBitmapXY(x, y - 1),
        encodeBitmapXY(x, y + 1),
      );
    }
    this.bitmapContext.putImageData(imageData, 0, 0);
  }

  viewToBitmapX(x: number) {
    return (x - this.bitmapX) / this.bitmapZoom;
  }

  viewToBitmapY(y: number) {
    return (y - this.bitmapY) / this.bitmapZoom;
  }

  bitmapToViewX(x: number) {
    return this.bitmapX + x * this.bitmapZoom;
  }

  bitmapToViewY(y: number) {
    return this.bitmapY + y * this.bitmapZoom;
  }

  draw() {
    this.viewContext.clearRect(0, 0, this.viewWidth, this.viewHeight);
    this.viewContext.drawImage(
      this.bitmapCanvas,
      this.bitmapX,
      this.bitmapY,
      this.bitmapWidth * this.bitmapZoom,
      this.bitmapHeight * this.bitmapZoom,
    );
    this.viewContext.strokeStyle = '#black';
    this.viewContext.strokeRect(
      this.bitmapToViewX(0),
      this.bitmapToViewY(0),
      (this.bitmapToViewX(this.bitmapWidth) - this.bitmapToViewX(0)),
      (this.bitmapToViewY(this.bitmapHeight) - this.bitmapToViewY(0)),
    );

    // Minimap.
    // Background.
    const minimapZoom = minimapWidth / this.bitmapWidth;
    this.minimapContext.fillStyle = '#dddd';
    this.minimapContext.fillRect(0, 0, minimapWidth, this.minimapCanvas.height);
    // Map.
    this.minimapContext.drawImage(this.bitmapCanvas, 0, 0, minimapWidth, this.minimapCanvas.height);
    // Minimap viewport.
    this.minimapContext.strokeStyle = 'black';
    this.minimapContext.strokeRect(
      this.viewToBitmapX(0) * minimapZoom,
      this.viewToBitmapY(0) * minimapZoom,
      (this.viewToBitmapX(this.viewWidth) - this.viewToBitmapX(0)) * minimapZoom,
      (this.viewToBitmapY(this.viewHeight) - this.viewToBitmapY(0)) * minimapZoom
    );
  }

  async runLoop() {
    while (true) {
      this.ensureToolTypeActive();
      await nextFrame();
      this.draw();
    }
  }
}
