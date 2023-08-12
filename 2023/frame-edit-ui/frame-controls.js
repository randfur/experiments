import {button} from './third-party/rojs/src/render-helpers.js';
import {read, write, readWrite} from './third-party/rojs/src/observable-json.js';

import {AnimationData} from './animation-data.js';
import {AnimationPlayer} from './animation-player.js';
import {FrameViewer} from './frame-viewer.js';

export class FrameControls {
  static uiTemplate = [
    button('<<', this.prevFrame),
    AnimationPlayer.uiTemplate,
    button('>>', this.nextFrame),
    button('Add️', this.addFrame),
    button('Duplicate', this.duplicateFrame),
    button('Delete', this.deleteFrame),
  ];

  static prevFrame() {
    readWrite(FrameViewer.model.selectedFrameIndex, x => {
      return Math.max(x - 1, 0);
    });
    FrameViewer.renderFrame();
  }

  static nextFrame() {
    readWrite(
      FrameViewer.model.selectedFrameIndex,
      x => Math.min(x + 1, AnimationData.frames.length - 1));
    FrameViewer.renderFrame();
  }

  static addFrame() {
    const newIndex = readWrite(
      FrameViewer.model.selectedFrameIndex,
      x => x + 1);
    AnimationData.frames.splice(newIndex, 0, AnimationData.createFrame());
    FrameViewer.renderFrame();
  }

  static duplicateFrame() {
    const oldIndex = read(FrameViewer.model.selectedFrameIndex);
    const oldFrame = AnimationData.frames[oldIndex];
    const newIndex = write(FrameViewer.model.selectedFrameIndex, oldIndex + 1);
    AnimationData.frames.splice(newIndex, 0, AnimationData.createFrame());
    FrameViewer.mutateSelectedFrame(context => {
      context.drawImage(oldFrame.canvas, 0, 0);
    });
  }

  static deleteFrame() {
    if (AnimationData.frames.length === 1) {
      AnimationData.frames[0] = AnimationData.createFrame();
      FrameViewer.renderFrame();
      return;
    }
    AnimationData.frames.splice(read(FrameViewer.model.selectedFrameIndex), 1);
    readWrite(FrameViewer.model.selectedFrameIndex, selectedFrame => {
      return Math.min(selectedFrame, AnimationData.frames.length - 1);
    });
    FrameViewer.renderFrame();
  }
}