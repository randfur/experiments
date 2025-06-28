import {Screen} from '../ui/Screen';
import {Mouse, MouseEventType, MouseButton} from '../ui/Mouse';
import {Key, KeyEventType} from '../ui/Key';
import {Editors} from '../core/Editors';
import {Tool} from '../core/Tool';
import {Scene} from '../core/Scene';
import {Entity} from '../core/Entity';
import {Button} from '../core/Button';
import {range, drawAll, handleMouseForAll} from '../core/utils';
import {DrawTool} from './DrawTool';

export class SpriteEditor {
  scene: Scene;
  entity: Entity;
  tool: Tool;
  buttons: Button[];
  
  constructor(scene: Scene, entity: Entity) {
    this.scene = scene;
    this.entity = entity;
    this.tool = new DrawTool(entity);
    this.buttons = [
      new Button({
        x: Screen.width / 4 - 75,
        y: Screen.height - 200,
        width: 200,
        height: 80,
        colour: 'red',
        text: 'Done',
        click: () => this.quit(),
      }),
    ];
  }

  quit() {
    Editors.stack.pop();
  }
  
  handleMouse(type: MouseEventType, button: MouseButton): boolean {
    if (this.tool.handleMouse(type, button)) {
      return true;
    }

    if (handleMouseForAll(this.buttons, type, button)) {
      return true;
    }
    
    if (type == MouseEventType.Click && button == MouseButton.Right) {
      this.quit();
      return true;
    }
    
    return false;
  }
  
  handleKey(type: KeyEventType, code: string): boolean {
    if (type == KeyEventType.Down) {
      if (code == 'Escape') {
        this.quit();
        return true;
      }
    }
    
    return false;
  }

  draw() {
    const context = Screen.context!;

    context.clearRect(0, 0, Screen.width, Screen.height);
    
    for (const entity of this.scene.entities) {
      if (entity != this.entity) {
        entity.draw();
      }
    }
    
    // Fade background.
    context.fillStyle = '#fffc';
    context.fillRect(0, 0, Screen.width, Screen.height);

    // Darken outside.
    context.fillStyle = '#0003';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Screen.width, 0);
    context.lineTo(Screen.width, Screen.height);
    context.lineTo(0, Screen.height);
    context.closePath();
    const {x, y, width, height} = this.entity;
    context.moveTo(x, y);
    context.lineTo(x, y + height);
    context.lineTo(x + width, y + height);
    context.lineTo(x + width, y);
    context.closePath();
    context.fill();

    this.entity.draw();
    
    this.tool.draw();
    
    drawAll(this.buttons);
  }
}