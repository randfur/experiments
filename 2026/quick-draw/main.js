import {Game, Pointer} from 'hex-game';
import {Vec3} from 'ga';

async function main() {
  Game.init({
    is3d: false,
    enableContextMenu: false,
  });
  Game.add(QuickDraw);
}

class QuickDraw {
  static init() {
    this.alive = true;
    this.points = [];
    this.deleteRadius = 20;
    this.pointerPosition = new Vec3();
    this.boxSize = Math.min(Game.width, Game.height) / 4;
  }

  static update() {
    let log = false;
    if (Pointer[0].down) {
      log = true;
      this.points.push(Pointer.position.clone());
    }
    if (Pointer[1].down) {
      log = true;
      this.points.push(null);
    }
    if (Pointer[2].down) {
      log = true;
      if (this.points.length > 0) {
        if (this.points[this.points.length - 1] === null) {
          this.points.splice(this.points.length - 1, 1);
        } else {
          this.points = this.points.filter(point => point === null || Vec3.setDelta(Pointer.position, point).length() > this.deleteRadius);
        }
      }
    }

    if (log) {
      console.log(`[\n${
        this.points.map(point => {
          if (point === null) {
            return '  null,\n';
          }
          const scaledPoint = Vec3.setScale(1 / this.boxSize, point);
          return `  new Vec3(${scaledPoint.x.toFixed(2)}, ${scaledPoint.y.toFixed(2)}),\n`;
        }).join('')
      }]`);
    }
  }

  static draw(hexLines) {
    for (const point of this.points) {
      if (point === null) {
        hexLines.addNull();
      } else {
        hexLines.addPoint({
          position: point,
          size: 4,
          colour: {r: 20, g: 50, b: 255},
        });
      }
    }
    hexLines.addNull();

    for (const point of this.points) {
      if (point !== null) {
        hexLines.addDot({
          position: point,
          size: this.deleteRadius,
          colour: {r: 255, g: 20, b: 50},
        });
      }
    }

    const white = {r: 255, g: 255, b: 255};
    hexLines.addPoints([
      {position: new Vec3(-this.boxSize, -this.boxSize), size: 3, colour: white},
      {position: new Vec3(this.boxSize, -this.boxSize), size: 3, colour: white},
      {position: new Vec3(this.boxSize, this.boxSize), size: 3, colour: white},
      {position: new Vec3(-this.boxSize, this.boxSize), size: 3, colour: white},
      {position: new Vec3(-this.boxSize, -this.boxSize), size: 3, colour: white},
      null,
      {position: new Vec3(-Game.width, 0), size: 1, colour: white},
      {position: new Vec3(Game.width, 0), size: 1, colour: white},
      null,
      {position: new Vec3(0, -Game.height), size: 1, colour: white},
      {position: new Vec3(0, Game.height), size: 1, colour: white},
      null,
    ]);

    const spokes = 50;
    for (let i = 0; i <= spokes; ++i) {
      hexLines.addPoint({
        position: new Vec3().setPolar(Math.PI * 2 * i / spokes, this.boxSize),
        size: 3,
        colour: white,
      });
    }
    hexLines.addNull();
  }
}

const buttons = [{
  positions: [
    new Vec3(-1.00, 1.01),
    new Vec3(-1.01, -0.99),
    new Vec3(1.02, -1.00),
    new Vec3(0.98, 1.00),
    new Vec3(-0.99, 1.02),
    null,
    new Vec3(-0.82, 0.40),
    new Vec3(-0.10, -0.39),
    null,
    new Vec3(-0.14, 0.41),
    new Vec3(-0.68, -0.37),
    null,
    new Vec3(0.13, 0.43),
    new Vec3(0.52, 0.01),
    null,
    new Vec3(0.72, 0.43),
    new Vec3(0.35, -0.44),
    null,
  ],
}, {
  positions: [
    new Vec3(-1.01, 1.00),
    new Vec3(1.00, 1.01),
    new Vec3(1.00, -1.00),
    new Vec3(-1.00, -0.98),
    new Vec3(-1.02, 1.00),
    null,
    new Vec3(-0.79, 0.52),
    new Vec3(-0.37, 0.11),
    null,
    new Vec3(-0.15, 0.50),
    new Vec3(-0.71, -0.59),
    null,
    new Vec3(0.17, 0.46),
    new Vec3(0.82, 0.43),
    new Vec3(0.09, -0.54),
    new Vec3(0.71, -0.51),
    null,
  ],
}, {
  positions: [
    new Vec3(-1.00, 1.01),
    new Vec3(1.04, 1.01),
    new Vec3(1.00, -0.97),
    new Vec3(-0.98, -0.99),
    new Vec3(-1.01, 1.00),
    null,
    new Vec3(-0.78, 0.58),
    new Vec3(-0.18, 0.60),
    new Vec3(-0.70, -0.53),
    new Vec3(-0.20, -0.59),
    null,
    new Vec3(0.14, 0.55),
    new Vec3(0.72, -0.56),
    null,
    new Vec3(0.76, 0.54),
    new Vec3(0.15, -0.60),
    null,
  ],
}];

main();
