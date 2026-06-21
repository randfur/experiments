import {createElement, createText} from './create-element.js';
import {model, loadSavedModel} from './model.js';
import {appElement} from './app.js';
import {range} from './utils.js';

export function renderBlueLinePicker() {
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: '24px',
      height: '50px',
      alignItems: 'center',
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
            fontSize: '24px',
            height: '50px',
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
              appElement.render();
            },
          },
          textContent: bellNumber,
        });
      }),
    ],
  });
}
