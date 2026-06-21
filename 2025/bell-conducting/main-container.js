import {createElement} from './create-element.js';
import {sequenceElement} from './sequence.js';

export function renderMainContainer() {
  return createElement({
    tag: 'div',
    style: {
      position: 'relative',
      flexGrow: '1',
    },
    children: [
      sequenceElement.render(),
    ],
  });
}
