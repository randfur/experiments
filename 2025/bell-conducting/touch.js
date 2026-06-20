import {createElement} from './create-element.js';
import {model} from './model.js';

export function renderTouch() {
  return createElement({
    tag: 'input',
    type: 'text',
    style: {
      fontSize: '16px',
      minWidth: '25vw',
    },
    value: model.selected.touch,
    disabled: true,
 });
}
