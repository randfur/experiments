import {loadSavedModel} from './storage.js';
import {renderMethodPicker} from './method-picker.js';
import {renderTouchPicker} from './touch-picker.js';
import {renderTouch} from './touch.js';
// import {renderBlueLinePicker} from './blue-line-picker.js';
import {renderSequence} from './sequence.js';
import {createElement} from './create-element.js';

let model = null;
let container = null;

function main() {
  model = loadSavedModel();
  container = document.createElement('div');
  container.style.paddingLeft = '20px';
  document.body.append(container);
  render();
}

function render() {
  container.replaceChildren(
    renderMethodPicker(model, render),
    createElement({tag: 'br'}),
    renderTouchPicker(model, render),
    createElement({tag: 'br'}),
    renderTouch(model),
    createElement({tag: 'br'}),
    // renderBlueLinePicker(model, render),
    createElement({tag: 'br'}),
    renderSequence(model, render),
  );
}

main();