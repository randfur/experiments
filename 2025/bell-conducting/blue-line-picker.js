import {createElement, createText} from './create-element.js';
import {range} from './utils.js';

export function renderBlueLinePicker(model, rerender) {
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: '20px',
      gap: '5px',
      fontFamily: 'sans-serif',
    },
    children: [
      createText('Highlight:'),
      ...range(model.methods[model.selected.methodName].bells).map(i => {
        const bellNumber = i + 1;
        return createElement({
          tag: 'button',
          style: {
            fontSize: '20px',
            width: '100px',
            ...(model.selected.blueLine === bellNumber ? {
              color: 'white',
              backgroundColor: 'blue',
              fontWeight: 'bold',
            } : {}),
          },
          events: {
            click: () => {
              model.selected.blueLine = bellNumber;
              rerender();
            },
          },
          textContent: bellNumber,
        });
      }),
    ],
  });
}
