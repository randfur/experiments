import {Engine} from './engine.js';
import {Entity} from './entity.js';
import {LineDrawing} from '../third-party/hex-lines/src/2d/line-drawing.js';
import {sleep, once, deviate} from './utils.js';

export class Ship extends Entity {
  static ensureInit = once(() => {
    Ship.lineBuffer = Engine.hexLines2d.createLineBuffer();
    const size = 10;
    const colour = {r: 255, g: 255, b: 255};
    Ship.lineBuffer.addLine([
      {position: {x: 50, y: 0}, size, colour},
      {position: {x: -50, y: 30}, size, colour},
      {position: {x: -50, y: -30}, size, colour},
      {position: {x: 50, y: 0}, size, colour},
    ]);
  });

  constructor(collisions) {
    super();
    Ship.ensureInit();

    this.collisions = collisions;
    collisions.register(this);

    this.drawing = new LineDrawing({lineBuffer: Ship.lineBuffer});
    this.position = {
      x: deviate(400),
      y: deviate(400),
    };
    this.radius = 50;
    this.scale = 1;
  }

  async run() {
    this.whileAlive(async () => {
      while (true) {
        await this.lifetimeScoped(Engine.nextFrame);
        this.position.x += deviate(Engine.time / 1000);
        this.position.y += deviate(Engine.time / 1000);
      }
    });

    this.whileAlive(async () => {
      while (true) {
        await this.lifetimeScoped(this.collisions.check);
        if (this.colliding) {
          break;
        }
      }

      await this.processDuration(1000, progress => {
        this.scale = 1 - progress;
      });

      this.destroy();
    });

    await this.lifetime;
  }

  draw() {
    this.drawing.transform = new Float32Array([
      this.scale, 0, this.position.x,
      0, this.scale, this.position.y,
      0, 0, 1,
    ]);
    return this.drawing;
  }
}
