import {createElement, createText} from './create-element.js';

export function renderMethodPicker(model, rerender) {
  const methodEntries = Object.entries(model.methods).sort(
    (a, b) => a[0].localeCompare(b[0]),
  );
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      gap: '5px',
      fontSize: '24px',
      fontFamily: 'sans-serif',
    },
    children: [
      createText('Method:'),
      createElement({
        tag: 'select',
        style: {
          fontSize: '24px',
          minWidth: '25vw',
          backgroundColor: '#fffc',
        },
        events: {
          change: event => {
            const select = event.currentTarget;
            model.selected.methodName = select.value;
            const method = model.methods[select.value];
            model.selected.touch = method.touches[0];
            model.selected.bellLine = Math.min(model.selected.bellLine, method.bells);
            rerender();
          },
        },
        children: methodEntries.map(([name, method]) => createElement({
          tag: 'option',
          textContent: name,
          selected: name === model.selected.methodName,
        })),
      }),
    ],
  });
}
