import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {FlightSquad} from './flight-squad.js';
import {Balloon} from './balloon.js';
import {snakeModel} from './model-data.js';
import {StarEmitter} from './star-emitter.js';
import {Slicer} from './slicer.js';
import {Shrapnel} from './shrapnel.js';
import {white} from './colours.js';
import {random, deviate, range, drawModel} from './utils.js';

export class Snake {
  constructor(game) {
    this.alive = false;
    for (const entity of game.entities) {
      if (entity instanceof FlightSquad) {
        if (entity.destroyed) {
          this.alive = true;
          break;
        }
      }
    }

    this.game = game;
    this.segmentCount = 5;
    this.segments = range(this.segmentCount).map(
      i => new Segment(
        game,
        this,
        i === 0
          ? snakeModel.head
          : i === this.segmentCount - 1
            ? snakeModel.tail
            : snakeModel.body,
        new Vec3(0, game.height + i * size * 2),
        new Vec3(0, -1),
      )
    );
    this.destroyedCount = 0;
    this.destroyed = false;
    this.targetPosition = new Vec3(deviate(game.width / 2), deviate(game.height / 2));
    this.remaining = duration;
  }

  update(time, timeDelta) {
    const head = this.segments[0];
    this.remaining -= timeDelta;
    if (this.remaining > 0) {
      while (getQuadrant(this.targetPosition) === getQuadrant(this.segments[0].position)) {
        this.targetPosition.setXyz(deviate(this.game.width), deviate(this.game.height)).inplaceScale(1 / 4);
      }
    } else {
      this.targetPosition.setXyz(0, Math.min(-this.game.height / 2 + size, head.position.y - size));
    }
    head.direction.inplaceTurnTowards(head.position, this.targetPosition, Math.cos(timeDelta * turnSpeed));
    head.position.inplaceScaleAdd(timeDelta * speed, head.direction);

    if (!this.destroyed) {
      for (const entity of this.game.entities) {
        if (entity.alive && entity instanceof Balloon) {
          if (Vec3.delta(head.position, entity.position).squareLength() < (size + entity.radius) ** 2) {
            entity.pop(/*directClick=*/false, /*scoresPoints=*/false);
          }
        }
      }
    }

    for (let i = 0; i < this.segmentCount - 1; ++i) {
      const segment = this.segments[i];
      const nextSegment = this.segments[i + 1];
      const segmentBack = Vec3.a.setScaleAdd(segment.position, -size, segment.direction);
      const direction = Vec3.b.setDelta(nextSegment.position, segmentBack).inplaceNormalise();
      if (segment.direction.dot(direction) < maxSegmentAngleCos) {
        const sign = Vec3.c.set(segment.direction).inplaceTurnXy().dot(direction) > 0 ? 1 : -1;
        nextSegment.direction
          .set(segment.direction)
          .inplaceRotateXy(Vec3.d.setXyz(maxSegmentAngleCos, sign * maxSegmentAngleSin));
      } else {
        nextSegment.direction.set(direction).inplaceNormalise();
      }
      nextSegment.position.setScaleAdd(segmentBack, -size, nextSegment.direction);
    }
  }

  click(position) {
    for (const segment of this.segments) {
      segment.click(position);
    }
  }

  segmentDestroyed(position) {
    ++this.destroyedCount;
    if (this.destroyedCount === this.segmentCount) {
      this.game.entities.push(new Slicer(this.game, position.clone()));
      this.destroyed = true;
      this.alive = false;
      for (const segment of this.segments) {
        segment.createShrapnel('destroyed');
      }
    }
  }

  draw(hexLines) {
    for (const segment of this.segments) {
      segment.draw(hexLines);
    }
  }
}

class Segment {
  constructor(game, snake, model, position, direction) {
    this.game = game;
    this.snake = snake;
    this.model = model;
    this.state = 'normal';
    this.position = position;
    this.direction = direction;
  }

  click(position) {
    if (this.state !== 'normal') {
      return;
    }
    if (Vec3.delta(this.position, position).squareLength() > size ** 2) {
      return;
    }

    this.state = 'destroyed';
    this.game.popCheck = true;
    this.game.incrementCombo();
    this.snake.segmentDestroyed(position);

    this.createShrapnel('normal');

    this.game.entities.push(new StarEmitter(
      this.game,
      this.position.clone(),
      size,
      this.game.comboLevel,
      /*bad=*/false,
    ));
  }

  createShrapnel(state) {
    Shrapnel.createForModel(
      this.game,
      this.model[state].base,
      this.position,
      position => this.transform(position),
      velocity => this.shrapnelVelocity(velocity),
      baseThickness,
      state === 'destroyed' ? spinesColour : baseColour,
    );
    Shrapnel.createForModel(
      this.game,
      this.model[state].spines,
      this.position,
      position => this.transform(position),
      velocity => this.shrapnelVelocity(velocity),
      spinesThickness,
      white,
    );
  }

  draw(hexLines) {
    drawModel(
      hexLines,
      this.model[this.state].base,
      baseThickness,
      baseColour,
      position => this.transform(Vec3.set(position)),
    );
    drawModel(
      hexLines,
      this.model[this.state].spines,
      spinesThickness,
      spinesColour,
      position => this.transform(Vec3.set(position)),
    );
  }

  transform(position) {
    return position
      .inplaceScale(size)
      .inplaceRotateXy(this.direction)
      .inplaceUnturnXy()
      .inplaceAdd(this.position);
  }

  shrapnelVelocity(velocity) {
    return velocity
      .inplaceScale(0.01)
      .inplaceScaleAdd(random(speed), this.direction)
      .inplaceAddXyz(deviate(0.01), deviate(0.01), deviate(2));
  }
}

const baseThickness = 6;
const spinesThickness = 8;
const size = 100;
const speed = 1.5;
const turnSpeed = 0.005;
const maxSegmentAngle = 0.9;
const maxSegmentAngleSin = Math.sin(maxSegmentAngle);
const maxSegmentAngleCos = Math.cos(maxSegmentAngle);
const duration = 5000;
const baseColour = {r: 100, g: 20, b: 200};
const spinesColour = {r: 180, g: 100, b: 255};

function getQuadrant(position) {
  return (position.x > 0 ? 1 : 0) + (position.y > 0 ? 2 : 0);
}
