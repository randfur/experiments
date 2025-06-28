import {Screen} from './ui/Screen';
import {Mouse, MouseEventType, MouseButton} from './ui/Mouse';
import {Key, KeyEventType} from './ui/Key';
import {Editors} from './core/Editors';
import {SceneEditor} from './scene-editor/SceneEditor';
import {Data} from './core/Data';
import {Scene} from './core/Scene';

function init() {
  Screen.init(document.getElementById('canvas') as HTMLCanvasElement);
  Mouse.init({
    handleMouse(type: MouseEventType, button: MouseButton | null) {
      return Editors.getActive()!.handleMouse(type, button);
    }
  });
  Key.init({
    handleKey(type: KeyEventType, code: string): boolean {
      return Editors.getActive()!.handleKey(type, code);
    }
  });
  Data.scenes.push(new Scene());
  Editors.stack.push(new SceneEditor(Data.scenes[0]));
  
  // // Test object.
  // Mouse.dragStart[Mouse.Left].x = 100;
  // Mouse.dragStart[Mouse.Left].y = 400;
  // Mouse.x = 100;
  // Mouse.y = 400;
  // Mouse.handle(Mouse.DragStart, Mouse.Left);
  // Mouse.x = 300;
  // Mouse.y = 500;
  // Mouse.handle(Mouse.DragMove, Mouse.Left);
  // Mouse.handle(Mouse.DragEnd, Mouse.Left);
}

async function main() {
  init();

  while (true) {
    await new Promise(requestAnimationFrame);
    Screen.context!.clearRect(0, 0, Screen.width, Screen.height);
    Editors.getActive()!.draw();
  }
}
main();