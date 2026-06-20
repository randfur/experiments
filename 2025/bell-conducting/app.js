import {createElement} from './create-element.js';
import {RenderableElement} from './renderable-element.js';
import {renderBlueLinePicker} from './blue-line-picker.js';
import {renderMethodPicker} from './method-picker.js';
import {sequence} from './sequence.js';
import {renderTouchPicker} from './touch-picker.js';
import {renderTouch} from './touch.js';

export const app = new RenderableElement(() => createElement({
  tag: 'div',
  style: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  children: [
    topContainer.render(),
    mainContainer.render(),
  ],
}));

export const topContainer = new RenderableElement(() => createElement({
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
  children: [
    renderMethodPicker(),
    renderTouchPicker(),
    renderTouch(),
    renderBlueLinePicker(),
  ],
}));

export const mainContainer = new RenderableElement(() => createElement({
  tag: 'div',
  id: 'mainContainer',
  style: {
    position: 'relative',
    flexGrow: '1',
    overflowY: 'scroll',
  },
  children: [
    sequence.render(),
  ],
}));
