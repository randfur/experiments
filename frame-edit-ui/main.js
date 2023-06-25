import {render} from './third-party/rojs/src/render.js';
import {joinBr} from './third-party/rojs/src/render-helpers.js';
import {FrameViewer} from './frame-viewer.js';
import {DrawingTool} from './drawing-tool.js';
import {StatusText} from './status-text.js';
import {FrameControls} from './frame-controls.js';
import {ColourPicker} from './colour-picker.js';

/*
# Components
- AnimationData:
  - Storage of animation frames.
- FrameViewer:
  - The display canvas, shows animation frames.
- DrawingTool:
  - Applies drawing edits to animation frames via the FrameViewer.
- StatusText:
  - Display editor state as text.
- AnimationPlayer:
  - Controls animation playback shown via the FrameViewer.
- FrameControls:
  - Controls for which animation frame is displayed for editing in the FrameViewer as well as adding/removing frames.
- ColourPicker:
  - Controls for changing the DrawingTool colour.
*/

function main() {
  DrawingTool.init();

  render(document.body, joinBr(
    FrameViewer.view.canvas,
    StatusText.uiTemplate,
    FrameControls.uiTemplate,
    ColourPicker.uiTemplate,
  ));
}
main();
