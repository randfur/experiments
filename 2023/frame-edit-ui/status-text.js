import {joinSpace} from './third-party/rojs/src/render-helpers.js';
import {htmlRead} from './third-party/rojs/src/render.js';
import {array} from './third-party/rojs/src/utils.js';
import {readMap} from './third-party/rojs/src/observable-json.js';

import {DrawingTool} from './drawing-tool.js';
import {FrameViewer} from './frame-viewer.js';

export class StatusText {
  static uiTemplate = joinSpace(
    array`Frame: ${htmlRead(FrameViewer.model.selectedFrameIndex, x => x + 1)}`,
    array`Colour: ${{
      tag: 'span',
      style: {
        color: () => readMap(
          DrawingTool.model.colour,
          colour => colour === 'black' ? 'white' : colour,
        ),
      },
      textContent: DrawingTool.model.colour,
    }}`,
  );
}
