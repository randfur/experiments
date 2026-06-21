import {createElement} from './create-element.js';
import {RenderableElement} from './renderable-element.js';
import {topContainerElement} from './top-container.js';
import {renderMainContainer} from './main-container.js';

export const appElement = new RenderableElement(() => createElement({
  tag: 'div',
  style: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
  },
  children: [
    topContainerElement.render(),
    renderMainContainer(),
  ],
}));
