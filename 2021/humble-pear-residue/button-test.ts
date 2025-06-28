import {Screen} from './ui/Screen';
import {Button} from './core/Button';
import {drawAll, handleMouseForAll} from './core/utils';
import {Mouse, MouseEventType, MouseButton} from './ui/Mouse';

function* makeButtons(click: () => void) {
  let height = 20;
  for (let y = 0; y < Screen.height;) {
    let width = 20;
    for (let x = 0; x < Screen.width;) {
      yield new Button({
        x,
        y,
        width,
        height,
        colour: 'red',
        text: `${width}x${height}`,
        click,
      });
      x += width + 10;
      width += 20;
    }
    y += height + 10;
    height += 20;
  }
}

async function main() {
  Screen.init(document.getElementById('canvas') as HTMLCanvasElement);
  let buttons: Button[] = [];
  function setButtons() {
    buttons = Array.from(makeButtons(setButtons));
  }
  setButtons();
  Mouse.init({
    handleMouse(type: MouseEventType, button: MouseButton | null) {
      return handleMouseForAll(buttons, type, button);
    }
  });
  while (true) {
    await new Promise(requestAnimationFrame);
    Screen.context!.clearRect(0, 0, Screen.width, Screen.height);
    drawAll(buttons);
  }
}
main();