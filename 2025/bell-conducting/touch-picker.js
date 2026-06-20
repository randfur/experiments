import {app} from './app.js';
import {createElement, createText} from './create-element.js';
import {model} from './model.js';

export function renderTouchPicker() {
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
            app.render();
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
