import {button, Component, read, write, readWrite} from '../third-party/rojs/src/rojs.js';

export class FrameControls extends Component {
  bundleInit() {
    this.view = [
      button('<<', () => this.prevFrame()),
      this.bundle.animationPlayer,
      button('>>', () => this.nextFrame()),
      button('Add️', () => this.addFrame()),
      button('Duplicate', () => this.duplicateFrame()),
      button('Delete', () => this.deleteFrame()),
    ];
   }

  prevFrame() {
    readWrite(this.bundle.frameViewer.model.selectedFrameIndex, x => {
      return Math.max(x - 1, 0);
    });
    this.bundle.frameViewer.renderFrame();
  }

  nextFrame() {
    readWrite(
      this.bundle.frameViewer.model.selectedFrameIndex,
      x => Math.min(x + 1, this.bundle.animationData.frames.length - 1));
    this.bundle.frameViewer.renderFrame();
  }

  addFrame() {
    const newIndex = readWrite(
      this.bundle.frameViewer.model.selectedFrameIndex,
      x => x + 1);
    this.bundle.animationData.frames.splice(newIndex, 0, this.bundle.animationData.createFrame());
    this.bundle.frameViewer.renderFrame();
  }

  duplicateFrame() {
    const oldIndex = read(this.bundle.frameViewer.model.selectedFrameIndex);
    const oldFrame = this.bundle.animationData.frames[oldIndex];
    const newIndex = write(this.bundle.frameViewer.model.selectedFrameIndex, oldIndex + 1);
    this.bundle.animationData.frames.splice(newIndex, 0, this.bundle.animationData.createFrame());
    this.bundle.frameViewer.mutateSelectedFrame(context => {
      context.drawImage(oldFrame.canvas, 0, 0);
    });
  }

  deleteFrame() {
    if (this.bundle.animationData.frames.length === 1) {
      this.bundle.animationData.frames[0] = this.bundle.animationData.createFrame();
      this.bundle.frameViewer.renderFrame();
      return;
    }
    this.bundle.animationData.frames.splice(read(this.bundle.frameViewer.model.selectedFrameIndex), 1);
    readWrite(this.bundle.frameViewer.model.selectedFrameIndex, selectedFrame => {
      return Math.min(selectedFrame, this.bundle.animationData.frames.length - 1);
    });
    this.bundle.frameViewer.renderFrame();
  }
}