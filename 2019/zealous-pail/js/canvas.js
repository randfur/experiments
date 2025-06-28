import Config from './config.js';

export default class Canvas {
  static element = document.getElementById('canvas');

  static width = null;
  static height = null;
  static context = null;
  static imageData = null;

  static setup() {
    Canvas.width = Math.ceil(innerWidth / Config.cellSize);
    Canvas.height = Math.ceil(innerHeight / Config.cellSize);
    Canvas.element.width = Canvas.width;
    Canvas.element.height = Canvas.height;
    Canvas.element.style.transform = `scale(${Config.cellSize})`;
    Canvas.context = Canvas.element.getContext('2d');
    Canvas.imageData = Canvas.context.createImageData(Canvas.width, Canvas.height);
  }
};