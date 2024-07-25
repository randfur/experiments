import {render, joinBr} from '../third-party/rojs/src/rojs.js';

import {bundleBundle} from './bundle.js';
import {AnimationData} from './animation-data.js';
import {AnimationPlayer} from './animation-player.js';
import {ColourPicker} from './colour-picker.js';
import {DrawingTool} from './drawing-tool.js';
import {FrameControls} from './frame-controls.js';
import {FrameViewer} from './frame-viewer.js';
import {StatusText} from './status-text.js';

function main() {
  const bundle = bundleBundle({
    animationData: new AnimationData(),
    animationPlayer: new AnimationPlayer(),
    colourPicker: new ColourPicker(),
    drawingTool: new DrawingTool(),
    frameControls: new FrameControls(),
    frameViewer: new FrameViewer(),
    statusText: new StatusText(),
  });

  render(document.body, joinBr(
    bundle.frameViewer,
    bundle.statusText,
    bundle.frameControls,
    bundle.colourPicker,
  ));
}

main();
