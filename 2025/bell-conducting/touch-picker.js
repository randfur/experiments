import {createElement, createText} from './create-element.js';

export function renderTouchPicker(model, rerender) {
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      gap: '5px',
      fontSize: '20px',
      fontFamily: 'sans-serif',
    },
    children: [
      createText('Touch:'),
      createElement({
        tag: 'select',
        style: {
          fontSize: '20px',
          minWidth: '25vw',
          backgroundColor: '#fff8',
        },
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
      }),
    ],
  });
}
