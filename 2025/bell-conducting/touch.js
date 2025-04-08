import {createElement} from './create-element.js';

export function renderTouch(model) {
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
