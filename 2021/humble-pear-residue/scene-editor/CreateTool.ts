import {Screen} from '../ui/Screen';
import {Mouse, MouseEventType, MouseButton} from '../ui/Mouse';
import {Data} from '../core/Data';
import {Scene} from '../core/Scene';
import {Entity} from '../core/Entity';
import {Editors} from '../core/Editors';
import {SpriteEditor} from '../sprite-editor/SpriteEditor';

const minSize = 4;

interface DragState {
  x: number,
  y: number,
  width: number,
  height: number,
}

export class CreateTool {
  scene : Scene;
  dragState: DragState | null;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.dragState = null;
  }
  
  handleMouse(type: MouseEventType, button: MouseButton): boolean {
    switch (button) {
      case MouseButton.Left:
        switch (type) {
          case MouseEventType.DragStart:
            this.dragState = {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
            };
            // Fallthrough.

          case MouseEventType.DragMove:
            if (this.dragState) {
              const {x: x1, y: y1} = Mouse.dragStart[MouseButton.Left];
              const {x: x2, y: y2} = Mouse;
              this.dragState.x = Math.min(x1, x2);
              this.dragState.y = Math.min(y1, y2);
              this.dragState.width = Math.max(x1, x2) - this.dragState.x;
              this.dragState.height = Math.max(y1, y2) - this.dragState.y;
              return true;
            }
            break;

          case MouseEventType.DragEnd:
            if (this.dragState) {
              const {x, y, width, height} = this.dragState;
              this.dragState = null;

              if (width > minSize && height > minSize) {
                const entity = new Entity({x, y, width, height});
                this.scene.entities.push(entity);
                Editors.stack.push(new SpriteEditor(this.scene, entity));
              }
              return true;
            }
            break;
        }
        break;

      case MouseButton.Right:
        if (type == MouseEventType.Down) {
          this.dragState = null;
          return true;
        }
        break;
    }
    return false;
  }

  draw() {
    const context = Screen.context!;
    if (this.dragState) {
      context.save();
      context.translate(0.5, 0.5);
      const {x, y, width, height} = this.dragState;
      context.strokeRect(x, y, width - 1, height - 1);
      context.restore();
    }
  }
}