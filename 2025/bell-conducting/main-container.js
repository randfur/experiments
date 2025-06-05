import {createElement} from './create-element.js';

export function renderMainContainer(children) {
  return createElement({
    tag: 'div',
    id: 'mainContainer',
    style: {
      position: 'relative',
      flexGrow: '1',
      overflowY: 'scroll',
    },
    children,
  });
}
