import {joinSpace, Component, htmlRead, array, readMap} from './third-party/rojs/src/rojs.js';

export class StatusText extends Component {
  bundleInit() {
    this.view = joinSpace(
      array`Frame: ${htmlRead(this.bundle.frameViewer.model.selectedFrameIndex, x => x + 1)}`,
      array`Colour: ${{
        tag: 'span',
        style: {
          color: () => readMap(
            this.bundle.drawingTool.model.colour,
            colour => colour === 'black' ? 'white' : colour,
          ),
        },
        textContent: this.bundle.drawingTool.model.colour,
      }}`,
    );
  }
}
