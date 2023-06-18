import {render, htmlIf} from './third-party/rojs/src/render.js';
import {button, brJoin} from './third-party/rojs/src/render-helpers.js';
import {array} from './third-party/rojs/src/utils.js';
import {createObservableJsonProxy, read, write} from './third-party/rojs/src/observable-json.js';

const width = 640;
const height = 480;
const framesPerSecond = 3;

const frames = [
  createFrame(),
];

const uiModel = createObservableJsonProxy({
  playing: false,
  selectedFrame: 0,
});

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.borderStyle = 'solid';
const context = canvas.getContext('2d');

render(document.body, brJoin(
  canvas,
  array`Frame: ${uiModel.selectedFrame}`,
  [
    button('<<', prevFrame),
    htmlIf(uiModel.playing,
      button('Pause', pause),
      button('Play', play),
    ),
    button('>>', nextFrame),
    button('🗑️', deleteFrame),
  ],
));

function createFrame() {
  const canvas = new OffscreenCanvas(width, height);
  return {
    canvas,
    context: canvas.getContext('2d'),
  };
}

function prevFrame() {
  console.log('TODO: prevFrame');
}

function nextFrame() {
  console.log('TODO: nextFrame');
}

function deleteFrame() {
  console.log('TODO: deleteFrame');
}

function pause() {
  write(uiModel.playing, false);
}

function play() {
  if (read(uiModel.playing)) {
    return;
  }

  write(uiModel.playing, true);
  (async () => {
    let startTime = null;
    while (true) {
      if (!read(uiModel.playing)) {
        break;
      }
      const time = await new Promise(requestAnimationFrame);
      if (startTime === null) {
        startTime = time;
      }
      const currentFrame = Math.floor((time - startTime) / 1000 * framesPerSecond);
      if (currentFrame >= frames.length) {
        write(uiModel.playing, false);
        break;
      }
      renderFrame(currentFrame);
    }
    renderFrame(read(uiModel.selectedFrame));
  })();
}

function renderFrame(frameIndex) {
  context.drawImage(frames[frameIndex].canvas, 0, 0);
}