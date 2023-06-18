import {createObservableJsonProxy} from './third-party/rojs/src/observable-json.js';

export class Model {
  static width = 640;
  static height = 480;
  static framesPerSecond = 3;
  static colours = [
    'white',
    'grey',
    'black',
    'red',
    'brown',
    'orange',
    'yellow',
    'lime',
    'green',
    'blue',
    'cyan',
    'pink',
    'purple',
  ];

  static frames = [
    this.createFrame(),
  ];

  static ui = createObservableJsonProxy({
    playing: false,
    selectedFrame: 0,
    colour: this.colours[0],
  });

  static createFrame() {
    const canvas = new OffscreenCanvas(this.width, this.height);
    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }
}

