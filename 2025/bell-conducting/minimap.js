import {createSvgElement} from './create-element.js';

export function renderMinimap(model, rerender) {
  return createSvgElement({
    tag: 'svg',
    style: {
      position: 'absolute',
      right: '0px',
      top: '0px',
    },
    children: [
      createSvgElement({
        tag: 'circle',
        attributes: {
          cx: '100',
          cy: '100',
          r: '50',
        },
        parentEvents: {
          mainContainer: {
            scroll: (event, element) => {
              element.setAttribute('cy', event.currentTarget.scrollTop);
            },
          },
        },
      }),
    ],
  });
}
