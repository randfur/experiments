import {createElement} from './create-element.js';
import {model} from './model.js';
import {RenderableElement} from './renderable-element.js';

export const touchElement = new RenderableElement(() => {
  return createElement({
    tag: 'input',
    type: 'text',
    style: {
      fontSize: '24px',
      height: '50px',
      minWidth: '50vw',
    },
    value: model.selected.touch,
    disabled: true,
 });
});
