import {Mouse, MouseEventType, MouseButton} from '../ui/Mouse';
import {Entity} from '../core/Entity';
import {Button} from '../core/Button';
import {drawAll, handleMouseForAll} from '../core/utils';
import {Screen} from '../ui/Screen';

export class DrawTool {
  entity: Entity;
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
  buttons: Button[];

  constructor(entity: Entity) {
    this.entity = entity;
    this.canvas = new OffscreenCanvas(Screen.width, Screen.height);
    this.context = this.canvas.getContext('2d')!;
    this.context.fillStyle = 'black';
    this.buttons = [
      'white',
      'black',
      'red',
      'orange',
      'yellow',
      'lime',
      'cyan',
      'blue',
      'purple',
      'magenta',
    ].map((colour, i) => new Button({
      x: 20,
      y: 40 + i * 61,
      width: 110,
      height: 60,
      colour,
      text: colour,
      click: () => {
        this.context.fillStyle = colour;
      },
    }));
  }

  handleMouse(type: MouseEventType, button: MouseButton): boolean {
    if (handleMouseForAll(this.buttons, type, button)) {
      return true;
    }

    if (button != MouseButton.Left) {
      return false;
    }
    
    if (type == MouseEventType.DragMove) {
      const {x: startX, y: startY} = Mouse.dragPrevious[MouseButton.Left];
      const {x: endX, y: endY} = Mouse;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      if (deltaX == 0 && deltaY == 0) {
        this.drawDot(Mouse.x, Mouse.y);
      } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        for (let x = startX; x != endX; x += Math.sign(deltaX)) {
          this.drawDot(x, startY + deltaY * (x - startX) / deltaX);
        }
      } else {
        for (let y = startY; y != endY; y += Math.sign(deltaY)) {
          this.drawDot(startX + deltaX * (y - startY) / deltaY, y);
        }
      }
      return true;
    }
    return false;
  }

  drawDot(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    this.context.fillRect(x - 2, y - 1, 4, 2);
    this.context.fillRect(x - 1, y - 2, 2, 4);
  }

  draw() {
    const context = Screen.context!;
    context.drawImage(this.canvas, 0, 0);
    
    drawAll(this.buttons);
  }
}