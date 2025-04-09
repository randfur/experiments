import {loadSavedModel} from './storage.js';
import {renderTopContainer} from './top-container.js';
import {renderMethodPicker} from './method-picker.js';
import {renderTouchPicker} from './touch-picker.js';
import {renderTouch} from './touch.js';
import {renderBlueLinePicker} from './blue-line-picker.js';
import {renderPinchZoomableSection} from './pinch-zoomable-section.js';
import {renderSequence} from './sequence.js';
import {createElement} from './create-element.js';

let model = null;
let container = null;

function main() {
  model = loadSavedModel();
  document.body.style.margin = '0';
  // document.body.style.touchAction = 'none';
  container = document.createElement('div');
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
    // renderPinchZoomableSection(model, render, [
      renderSequence(model, render),
    // ]),
  );
}

main();