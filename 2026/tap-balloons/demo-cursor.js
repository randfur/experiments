import {Vec3} from '../../third-party/ga/vec3.js';
import {Aeroplane} from './aeroplane.js';
import {Shockwave} from './shockwave.js';
import {Balloon} from './balloon.js';
import {Slicer} from './slicer.js';
import {SnakeSegment} from './snake.js';
import {demoCursorModel} from './model-data.js';
import {white} from './colours.js';
import {drawModel, drawString} from './utils.js';

export class DemoCursor {
  constructor(game) {
    this.alive = true;
    this.game = game;
    this.position = new Vec3();
    this.velocity = new Vec3();
    this.time = 0;
  }

  update(time, timeDelta) {
    this.time = time;
    let target = null;
    let targetSquareDistance = null;
    let slicing = false;
    for (const entity of this.game.entities) {
      if (entity instanceof Slicer) {
        slicing = true;
      }
      const entityRank = getEntityRank(entity);
      const targetRank = getEntityRank(target);
      if (entityRank > 0 && (target === null || targetRank <= entityRank)) {
        const entitySquareDistance = Vec3.delta(this.position, entity.position).squareLength();
        if (targetRank === entityRank && targetSquareDistance < entitySquareDistance) {
          continue;
        }
        target = entity;
        targetSquareDistance = entitySquareDistance;
      }
    }

    if (target !== null) {
      const delta = Vec3.delta(this.position, target.position);
      const distance = delta.length();
      const speed = this.velocity.length();
      const dot = this.velocity.dot(delta);
      const limit = speed * distance * 0.7;
      if (!slicing && speed > 0.1 && dot < limit) {
        this.velocity.inplaceScale(0.5);
      } else {
        this.velocity.inplaceScaleAdd(timeDelta / 40_000, delta);
      }
    } else {
      this.velocity.inplaceScale(0.8);
    }

    if (this.position.x > this.game.width / 2 && this.velocity.x > 0) { this.velocity.x *= -1; }
    if (this.position.x < -this.game.width / 2 && this.velocity.x < 0) { this.velocity.x *= -1; }
    if (this.position.y > this.game.height / 2 && this.velocity.y > 0) { this.velocity.y *= -1; }
    if (this.position.y < -this.game.height / 2 && this.velocity.y < 0) { this.velocity.y *= -1; }

    this.position.inplaceScaleAdd(timeDelta, this.velocity);
    this.game.pointerMove(this.position);

    if (target !== null && Vec3.delta(this.position, target.position).squareLength() < (target.radius * 0.9) ** 2) {
      this.game.click(this.position);
      this.game.entities.push(new Shockwave(
        this.position.clone(),
        white,
        25,
        2,
      ));
    }
  }

  draw(hexLines) {
    drawModel(hexLines, demoCursorModel, 5, white, position => {
      return Vec3.scale(50, position).inplaceAdd(this.position);
    });

    if (Math.floor(this.time / 1000) % 2 === 0) {
      drawString(hexLines, '< DEMO MODE >', 10, white, position => {
        return Vec3.scale(20, position).inplaceAddXyz(0, -this.game.height / 4);
      });
    }
  }
}

function getEntityRank(entity) {
  if (entity instanceof Balloon) {
    if (entity.type === 'normal') {
      if (entity.radius > 60) {
        return 1;
      }
    } else if (entity.type === 'cleanUp') {
      return 2;
    }
  } else if (entity instanceof Aeroplane) {
    return 3;
  } else if (entity instanceof SnakeSegment) {
    if (entity.state === 'normal') {
      return 4;
    }
  }

  return 0;
}