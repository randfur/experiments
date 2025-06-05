import {createElement} from './create-element.js';
import {loadSavedModel} from './storage.js';
import {renderBlueLinePicker} from './blue-line-picker.js';
import {renderMainContainer} from './main-container.js';
import {renderMethodPicker} from './method-picker.js';
import {renderMinimap} from './minimap.js';
import {renderSequence} from './sequence.js';
import {renderTopContainer} from './top-container.js';
import {renderTouchPicker} from './touch-picker.js';
import {renderTouch} from './touch.js';

let model = null;
let container = null;

function main() {
  model = loadSavedModel();
  document.body.style.margin = '0';
  document.body.style.touchAction = 'manipulation';
  container = createElement({
    tag: 'div',
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  });
  document.body.append(container);
  render();
}

function render() {
  container.replaceChildren(
    renderTopContainer([
      renderMethodPicker(model, render),
      renderTouchPicker(model, render),
      renderTouch(model),
      renderBlueLinePicker(model, render),
    ]),
    renderMainContainer([
      renderSequence(model, render),
      renderMinimap(model, render),
    ]),
  );
}

main();