import {Vec3} from '../../third-party/ga/vec3.js';
import {Balloon} from './balloon.js';
import {Shockwave} from './shockwave.js';
import {Shrapnel} from './shrapnel.js';
import {cleanUpBalloonModel} from './model-data.js';
import {random, range} from './utils.js';

export class Slicer {
  constructor(game, position) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.trail = range(10).map(i => new Vec3().set(position));
    this.trail
  }

  click(position) {
    this.game.popCheck = true;
    for (const entity of this.game.entities) {
      if (entity.alive && entity instanceof Balloon && entity.type === 'cleanUp') {
        this.game.entities.push(new Shockwave(entity.position, colour, Math.max(100, entity.radius), 4));
        return;
      }
    }
  }

  pointerMove(position) {
    pointerDelta.setDelta(this.position, position);
    const length = pointerDelta.length();
    for (let x = 0; x < length; x += 10) {
      hitTestPosition.setScaleAdd(this.position, x / length, pointerDelta);
      for (const entity of this.game.entities) {
        if (entity.alive && entity instanceof Balloon) {
          if (entity.type === 'bad' && entity.radius < 50) {
            continue;
          }
          if (balloonDelta.setDelta(hitTestPosition, entity.position).squareLength() < entity.radius ** 2) {
            entity.pop(/*directClick=*/true, /*scoresPoints=*/true);

            if (entity.type === 'cleanUp') {
              Shrapnel.createForModel(
                this.game,
                cleanUpBalloonModel,
                entity.position,
                position => entity.transform(position),
                velocity => velocity.inplaceScale(0.01).inplaceAddXyz(0, 0, random(-1)),
                entity.thickness(),
                colour,
              );
            }
          }
        }
      }
    }
    this.position.set(position);
  }

  update(time, timeDelta) {
    for (let i = this.trail.length; 0 <= --i;) {
      this.trail[i].set(i > 0 ? this.trail[i - 1] : this.position);
    }
  }

  draw(hexLines) {
    for (let i = 0; i < this.trail.length; ++i) {
      hexLines.addPointParts(this.trail[i], maxThickness * (1 - i / this.trail.length), colour);
    }
    hexLines.addNull();
  }
}

const pointerDelta = new Vec3();
const hitTestPosition = new Vec3();
const balloonDelta = new Vec3();
const maxThickness = 10;
const colour = {r: 180, g: 100, b: 255};
