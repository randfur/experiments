import {Config} from './config.js';

export let Canvas = {
  element: document.getElementById('canvas'),

  width: null,
  height: null,
  context: null,
  imageData: null,

  setup() {
    Canvas.width = Math.floor(innerWidth / Config.cellSize);
    Canvas.height = Math.floor(innerHeight / Config.cellSize);
    Canvas.element.width = Canvas.width;
    Canvas.element.height = Canvas.height;
    Canvas.element.style.transform = `scale(${Config.cellSize})`;
    Canvas.context = Canvas.element.getContext('2d');
    Canvas.imageData = Canvas.context.createImageData(Canvas.width, Canvas.height);
  },
};