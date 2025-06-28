import {Mouse, MouseEventType, MouseButton} from '../ui/Mouse';
import {Screen} from '../ui/Screen';
import {TAU, random, randomLow, randomMid, randomHigh, randomRange, deviate, deviateMid} from './utils';

export interface ButtonParams {
  x: number;
  y: number;
  width: number;
  height: number;
  colour: string;
  text: string;
  click: () => void;
}

export class Button {
  params: ButtonParams;
  highlight: boolean;
  fillCanvas: OffscreenCanvas;
  strokeCanvas: OffscreenCanvas;
  strokeHighlightCanvas: OffscreenCanvas;
  font: string;
  textWidth: number;
  textY: number;

  constructor(params: ButtonParams) {
    this.params = params;
    this.highlight = false;

    const {width, height, colour, text} = params;
    this.fillCanvas = new OffscreenCanvas(width, height);
    this.strokeCanvas = new OffscreenCanvas(width, height);
    this.strokeHighlightCanvas = new OffscreenCanvas(width, height);
    drawBrushSwipe(this.fillCanvas, colour);
    drawOutline(this.fillCanvas, this.strokeCanvas);
    drawSingleColour(this.strokeCanvas, this.strokeHighlightCanvas, 'white');
    
    this.font = '16px cursive';
    Screen.context!.font = this.font;
    this.textWidth = Screen.context!.measureText(text).width;
    this.textY = findMidY(this.fillCanvas);
  }
  
  inBounds(x: number, y: number): boolean {
    return x >= this.params.x && y >= this.params.y && x <= this.params.x + this.params.width && y <= this.params.y + this.params.height;
  }
  
  handleMouse(type: MouseEventType, button: MouseButton): boolean {
    if (type == MouseEventType.Move) {
      this.highlight = this.inBounds(Mouse.x, Mouse.y);
      return false;
    }
    if (type == MouseEventType.Down && button == MouseButton.Left && this.inBounds(Mouse.x, Mouse.y)) {
      Mouse.isDown[MouseButton.Left] = false;
      this.params.click();
      return true;
    }
    return false;
  }
  
  draw() {
    const context = Screen.context!;
    // context.fillStyle = this.highlight ? 'yellow' : 'white';
    // context.strokeStyle = 'black';
    // context.beginPath();
    // context.rect(
    //   Math.floor(this.x) + 0.5,
    //   Math.floor(this.y) + 0.5,
    //   this.width,
    //   this.height);
    // context.fill();
    // context.stroke();

    context.drawImage(this.fillCanvas, this.params.x, this.params.y);
    context.drawImage(this.highlight ? this.strokeHighlightCanvas : this.strokeCanvas, this.params.x, this.params.y);
    
    context.fillStyle = this.highlight ? 'white' : 'black';
    context.textBaseline = 'middle';
    context.font = this.font;
    context.fillText(
      this.params.text,
      this.params.x + this.params.width * 0.45 - this.textWidth / 2,
      this.params.y + this.textY);
  }
}

function drawBrushSwipe(canvas: OffscreenCanvas, colour: string) {
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext('2d')!;
  context.fillStyle = colour;

  function clampY(y: number, buffer: number) {
    return Math.min(height - buffer, Math.max(buffer, y));
  }

  const startYDelta = deviate(height / 4);
  const aYDelta = -startYDelta * 2;
  const bYDelta = aYDelta - (10 + randomMid(30)) * Math.sign(aYDelta);
  const endYDelta = bYDelta - (10 + randomMid(10)) * Math.sign(bYDelta);
  
  for (let i = 0; i < height * 0.75; ++i) {
    const startRadius = randomMid(5);
    let startX = 5 + startRadius + randomHigh(20);
    let startY = clampY(height / 2 + startYDelta + deviateMid(height / 2), startX * 0.75);
    
    const aRadius = 5 + randomMid(4);
    const controlAX = width * (0.5 + deviate(0.1));
    const controlAY = clampY(startY + aYDelta * randomRange(1, 1.1), 0);
    
    const bRadius = 1 + random(2);
    const controlBX = width - randomHigh(30) - 30;
    const controlBY = clampY(startY + bYDelta * randomRange(1, 1.1), 0);

    const endRadius = randomLow(1);
    const endGap = randomHigh(30) + endRadius;
    const endX = width - endGap;
    const endY = clampY(startY + endYDelta * randomRange(0.5, 1.5), endRadius + 5 + endGap / 2);

    context.beginPath();
    context.arc(startX, startY, startRadius, TAU / 4, TAU * 3 / 4);
    context.bezierCurveTo(controlAX, controlAY - aRadius, controlBX, controlBY - bRadius, endX, endY - endRadius);
    context.arc(endX, endY, endRadius, TAU * 3 / 4, TAU / 4);
    context.bezierCurveTo(controlBX, controlBY + bRadius, controlAX, controlAY + aRadius, startX, startY + startRadius);
    context.fill();
  }
}

function drawOutline(inCanvas: OffscreenCanvas, outCanvas: OffscreenCanvas) {
  const context = outCanvas.getContext('2d')!;
  const data = inCanvas.getContext('2d')!.getImageData(0, 0, inCanvas.width, inCanvas.height).data;
  let on = false;
  function process(x: number, y: number) {
    const alpha = data[4 * (y * inCanvas.width + x) + 3];
    const nextOn = alpha > 127;
    if (on != nextOn || (alpha > 0 && alpha < 255)) {
      context.fillRect(x, y, 1, 1);
    }
    on = nextOn;
  }
  for (let x = 0; x < inCanvas.width; ++x) {
    for (let y = 0; y < inCanvas.height; ++y) {
      process(x, y);
    }
  }
  for (let y = 0; y < inCanvas.height; ++y) {
    for (let x = 0; x < inCanvas.width; ++x) {
      process(x, y);
    }
  }
}

function drawSingleColour(inCanvas: OffscreenCanvas, outCanvas: OffscreenCanvas, colour: string) {
  const context = outCanvas.getContext('2d')!;
  context.drawImage(inCanvas, 0, 0);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = colour;
  context.fillRect(0, 0, outCanvas.width, outCanvas.height);
}

function findMidY(canvas: OffscreenCanvas): number {
  const data = canvas.getContext('2d')!.getImageData(Math.floor(canvas.width / 2), 0, 1, canvas.height).data;
  let topY = 0;
  let bottomY = canvas.height - 1;
  for (; topY < canvas.height; ++topY) {
    if (data[4 * topY + 3] != 0) {
      break;
    }
  }
  for (; bottomY > 0; --bottomY) {
    if (data[4 * bottomY + 3] != 0) {
      break;
    }
  }
  return Math.floor((topY + bottomY) / 2);
}