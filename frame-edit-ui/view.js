import {read, readMap} from './third-party/rojs/src/observable-json.js';
import {render, htmlIf} from './third-party/rojs/src/render.js';
import {button, joinBr, joinSpace} from './third-party/rojs/src/render-helpers.js';
import {array} from './third-party/rojs/src/utils.js';

import {Model} from './model.js';
import {Controller} from './controller.js';

export class View {
  static init() {
    const canvas = document.createElement('canvas');
    canvas.width = Model.width;
    canvas.height = Model.height;
    canvas.style.borderStyle = 'solid';
    this.context = canvas.getContext('2d');

    const statusText = joinSpace(
      array`Frame: ${Model.ui.selectedFrame}`,
      array`Colour: ${{
        tag: 'span',
        style: {
          color: () => readMap(
            Model.ui.colour,
            colour => colour === 'black' ? 'white' : colour,
          ),
        },
        textContent: Model.ui.colour,
      }}`,
    );

    const frameButtons = [
      button('<<', Controller.prevFrame),
      htmlIf(Model.ui.playing,
        button('Pause', Controller.pause),
        button('Play', Controller.play),
      ),
      button('>>', Controller.nextFrame),
      button('🞧️', Controller.addFrame),
      button('🗐', Controller.duplicateFrame),
      button('🞮️', Controller.deleteFrame),
    ];

    const colourButtons = Model.colours.map(colour => ({
      tag: 'button',
      events: {
        click: () => Controller.setColour(colour),
      },
      children: [{
        style: {
          width: '16px',
          height: '16px',
          backgroundColor: colour,
        },
      }],
    }));

    render(document.body, joinBr(
      canvas,
      statusText,
      frameButtons,
      colourButtons,
    ));

    registerPointerEvents(canvas, {
      click: Controller.drawDot,
      dragStart: Controller.drawStart,
      dragMove: Controller.drawMove,
      dragEnd: Controller.drawEnd,
    });
  }

  static renderFrame(frameIndex=read(Model.ui.selectedFrame)) {
    this.context.clearRect(0, 0, Model.width, Model.height);
    this.context.drawImage(Model.frames[frameIndex].canvas, 0, 0);
  }
}

function registerPointerEvents(element, {click, dragStart, dragMove, dragEnd}) {
  let dragging = false;
  let down = false;
  let downX = null;
  let downY = null;
  element.addEventListener('pointerdown', ({offsetX: x, offsetY: y}) => {
    if (down) {
      return;
    }
    down = true;
    downX = x;
    downY = y;
  });
  element.addEventListener('pointermove', ({offsetX: x, offsetY: y}) => {
    if (!down) {
      return;
    }
    if (!dragging) {
      if (downX === x && downY === y) {
        return;
      }
      dragging = true;
      dragStart(downX, downY);
    }
    dragMove(x, y, downX, downY);
    downX = x;
    downY = y;
  });
  element.addEventListener('pointerup', ({offsetX: x, offsetY: y}) => {
    if (!down) {
      return;
    }
    down = false;
    if (dragging) {
      dragging = false;
      dragEnd(x, y);
    } else {
      click(x, y);
    }
  });
}