import {Engine} from './engine.js';

function main() {
  Engine.init();
  Engine.spawn(Thing);
  Engine.run();
}

class Thing {
  constructor() {
    this.start = {
      position: {x: 0, y: 0, z: 1000},
      size: 10,
      colour: {r: 255, g: 255, b: 255},
    };
    this.end = {
      position: {x: 100, y: 100, z: 1000},
      size: 10,
      colour: {r: 255, g: 255, b: 255},
    };
  }

  async run() {
    await new Promise(() => {});
  }

  draw(hexLines) {
    hexLines.addPoint(this.start);
    hexLines.addPoint(this.end);
    hexLines.addNull();
  }
}

main();
