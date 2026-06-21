import {appElement} from './app.js';
import {createElement, createText} from './create-element.js';
import {model} from './model.js';

export function renderTouchPicker() {
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      gap: '5px',
      fontSize: '24px',
      alignItems: 'center',
      fontFamily: 'sans-serif',
    },
    children: [
      createText('Touch:'),
      createElement({
        tag: 'select',
        style: {
          fontSize: '24px',
          height: '50px',
          minWidth: '50vw',
          backgroundColor: '#fff8',
        },
        events: {
          change: event => {
            model.selected.touch = event.currentTarget.value;
            appElement.render();
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
