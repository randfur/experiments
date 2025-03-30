import {createElement} from './create-element.js';

export function renderTouchPicker(model, rerender) {
  return createElement({
    tag: 'select',
    events: {
      change: event => {
        model.selected.touch = event.currentTarget.value;
        rerender();
      },
    },
    children: model.methods[model.selected.methodName].touches.map(touch => createElement({
      tag: 'option',
      textContent: touch,
      selected: touch === model.selected.touch,
    })),
  });
}
