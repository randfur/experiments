import {createElement} from './create-element.js';
import {model} from './model.js';
import {touchElement} from './touch.js';
import {sequenceElement} from './sequence.js';

export function renderClearTouch() {
  return createElement({
    tag: 'button',
    textContent: 'Clear touch',
    style: {
      fontSize: '24px',
      height: '50px',
      width: 'fit-content',
    },
    events: {
      click: () => {
        model.selected.touch = 'P';
        sequenceElement.render();
        touchElement.render();
      },
    },
  });
}
