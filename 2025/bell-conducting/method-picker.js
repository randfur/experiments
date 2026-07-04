import {appElement} from './app.js';
import {createElement, createText} from './create-element.js';
import {model} from './model.js';

export function renderMethodPicker() {
  const methodEntries = Object.entries(model.methods).sort(
    (a, b) => a[0].localeCompare(b[0]),
  );
  const selectedFullName = `${model.selected.methodName} ${countToName(model.selected.methodBellCount)}`;
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      alignItems: 'center',
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
          height: '50px',
          minWidth: '50vw',
          backgroundColor: '#fffc',
        },
        events: {
          change: event => {
            const select = event.currentTarget;
            model.selected.methodName = select.selectedOptions[0].dataset.name;
            model.selected.methodBellCount = Number(select.selectedOptions[0].dataset.count);
            const method = model.methods[model.selected.methodName][model.selected.methodBellCount];
            model.selected.touch = method.touches[0];
            model.selected.blueLine = Math.min(model.selected.blueLine, model.selected.methodBellCount);
            appElement.render();
          },
        },
        children: methodEntries.flatMap(([name, bellCountSpec]) => {
          return Object.entries(bellCountSpec).map(([count, _]) => {
            const fullName = `${name} ${countToName(Number(count))}`;
            return createElement({
              tag: 'option',
              textContent: fullName,
              selected: fullName === selectedFullName,
              dataset: {
                name: name,
                count: count,
              },
            });
          });
        }),
      }),
    ],
  });
}

function countToName(count) {
  switch (count) {
  case 3: return 'Singles';
  case 4: return 'Minimus';
  case 5: return 'Doubles';
  case 6: return 'Minor';
  case 7: return 'Triples';
  case 8: return 'Major';
  case 9: return 'Caters';
  case 10: return 'Royal';
  case 11: return 'Cinques';
  case 12: return 'Maximus';
  default: return count;
  }
}