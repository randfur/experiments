import {render, htmlIf} from './third-party/rojs/src/render.js';
import {button, brJoin} from './third-party/rojs/src/render-helpers.js';
import {createObservableJsonProxy, write} from './third-party/rojs/src/observable-json.js';

const width = 640;
const height = 480;

const frames = [
  new OffscreenCanvas(width, height),
];

const uiProxy = createObservableJsonProxy({
  playing: false,
  selectedFrame: 0,
});

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.borderStyle = 'solid';

render(document.body, brJoin(
  canvas,
  [
    button('<<', prevFrame),
    htmlIf(uiProxy.playing,
      button('Pause', pause),
      button('Play', play),
    ),
    button('>>', nextFrame),
  ],
));


function prevFrame() {
}

function nextFrame() {
}

function pause() {
  write(uiProxy.playing, false);
}

function play() {
  write(uiProxy.playing, true);
}
