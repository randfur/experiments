import {createElement} from './create-element.js';

export function renderHeading() {
  return createElement({
    tag: 'h1',
    style: {
      fontFamily: 'sans-serif',
      fontSize: '40px',
      color: '#426',
    },
    textContent: '🔔 Bell Conducting 📝',
  });
}
