import {createElement} from './create-element.js';
import {RenderableElement} from './renderable-element.js';
import {renderHeading} from './heading.js';
import {renderBlueLinePicker} from './blue-line-picker.js';
import {renderMethodPicker} from './method-picker.js';
import {renderClearTouch} from './clear-touch.js';
import {touchElement} from './touch.js';

export const topContainerElement = new RenderableElement(() => createElement({
  tag: 'div',
  style: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '20px',
    paddingRight: '20vw',
    paddingBottom: '20px',
    paddingTop: '20px',
    gap: '10px',
    backgroundColor: '#bac',
  },
  children: [
    renderHeading(),
    renderMethodPicker(),
    // renderTouchPicker(),
    touchElement.render(),
    renderClearTouch(),
    renderBlueLinePicker(),
  ],
}));
