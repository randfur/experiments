import {GroupDrawing} from './third-party/hex-lines/src/2d/group-drawing.js';
import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';

export class Animation {
  constructor(hexLines2d, animationData) {
    this.hexLines2d = hexLines2d;
    this.animationData = animationData;
    this.lineBufferMap = {};
    for (const [lineBufferId, lineBufferData] of Object.entries(this.animationData.lineBufferDataMap)) {
      const lineBuffer = this.hexLines2d.createLineBuffer();
      lineBuffer.addRawPointsData(lineBufferData);
      this.lineBufferMap[lineBufferId] = lineBuffer;
    }
  }

  draw(timeSeconds) {
    this.hexLines2d.draw(this.buildSpriteDrawing('', timeSeconds));
  }

  buildSpriteDrawing(spriteId, timeSeconds) {
    const sprite = this.animationData.spriteMap[spriteId];
    // const guideDrawing = new GroupDrawing({});
    const targetFrame = timeSeconds * sprite.framesPerSecond;
    const visibleDrawing = new GroupDrawing({
      children: sprite.visibleLayers.map(layer => {
        const keyframe = getKeyframe(layer.keyframes, targetFrame);
        const group = keyframe.group;
        return new GroupDrawing({
          transform: getTransform(layer.animatedTransform),
          pixelSize: sprite.pixelSize,
          children: [
            new GroupDrawing({
              transform: getTransform(group.animatedTransform, targetFrame - keyframe.frame),
              children: group.children.map(child => {
                switch (child.type) {
                case 'group':
                  // TODO.
                  return null;
                case 'lineBuffer':
                  return new LineDrawing({
                    lineBuffer: this.lineBufferMap[child.lineBufferId],
                    transform: getTransform(child.animatedTransform),
                  });
                case 'sprite':
                  // TODO.
                  return null;
                }
              }),
            }),
          ],
        });
      }),
    });
    return visibleDrawing;
  }
}

function getTransform(animatedTransform, targetFrame) {
  // TODO.
  return null;
}

function getKeyframe(keyframes, targetFrame) {
  let high = keyframes.length - 1;
  let low = 0;
  while (low < high) {
    const mid = Math.floor((high + low) / 2);
    const keyframe = keyframes[mid];
    if (keyframe.frame > targetFrame) {
      high = mid - 1;
    } else if (keyframe.frame + keyframe.frames < targetFrame) {
      low = mid + 1;
    } else {
      return keyframe;
    }
  }
  return keyframes[low];
}
