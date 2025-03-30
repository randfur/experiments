import {createElement} from './create-element.js';

export function renderTouch(model) {
  return createElement({
    tag: 'input',
    type: 'text',
    value: model.selected.touch,
    disabled: true,
 });
}
