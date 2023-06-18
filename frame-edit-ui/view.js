import {readMap} from './third-party/rojs/src/observable-json.js';
import {render, htmlIf} from './third-party/rojs/src/render.js';
import {button, joinBr, joinSpace} from './third-party/rojs/src/render-helpers.js';
import {array} from './third-party/rojs/src/utils.js';

import {Model} from './model.js';
import {Controller} from './controller.js';

export class View {
  static init() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = Model.width;
    this.canvas.height = Model.height;
    this.canvas.style.borderStyle = 'solid';
    this.context = this.canvas.getContext('2d');

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
      button('🗑️', Controller.deleteFrame),
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
      this.canvas,
      statusText,
      frameButtons,
      colourButtons,
    ));
  }

  static renderFrame(frameIndex) {
    this.context.clearRect(0, 0, Model.width, Model.height);
    this.context.drawImage(Model.frames[frameIndex].canvas, 0, 0);
  }
}