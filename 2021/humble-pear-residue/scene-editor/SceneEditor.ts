import {Screen} from '../ui/Screen';
import {Data} from '../core/Data';
import {Scene} from '../core/Scene';
import {Tool} from '../core/Tool';
import {Mouse, MouseEventType, MouseButton} from '../ui/Mouse';
import {CreateTool} from './CreateTool';
import {Editors} from '../core/Editors';
import {Key, KeyEventType} from '../ui/Key';
import {drawAll} from '../core/utils';

export class SceneEditor {
  scene: Scene;
  tool: Tool;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.tool = new CreateTool(scene);
  }
  
  handleMouse(type: MouseEventType, button: MouseButton): boolean {
    return this.tool.handleMouse(type, button);
  }
  
  handleKey(type: KeyEventType, code: string): boolean {
    if (type == KeyEventType.Down) {
      if (code == 'Escape') {
        Editors.stack.pop();
        return true;
      }
    }
    return false;
  }

  draw() {
    drawAll(this.scene.entities);
    this.tool.draw();
  }
}