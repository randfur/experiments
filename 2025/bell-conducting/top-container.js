import {createElement} from './create-element.js';

export function renderTopContainer(children) {
  return createElement({
    tag: 'div',
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '20px',
      paddingRight: '20vw',
      paddingBottom: '10px',
      paddingTop: '20px',
      gap: '10px',
      position: 'sticky',
      top: '0',
      zIndex: 1,
      backgroundColor: '#bac',
    },
    children,
  });
}
