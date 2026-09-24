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
    let targetScore = null;
    let slicing = false;
    for (const entity of this.game.entities) {
      if (entity instanceof Slicer) {
        slicing = true;
      }
      const entityRank = getEntityRank(this.game, entity);
      const targetRank = getEntityRank(this.game, target);
      if (entityRank > 0 && (target === null || targetRank <= entityRank)) {
        const delta = Vec3.a.setDelta(this.position, entity.position);
        const entityScore = delta.squareLength() - 100 * delta.dot(this.velocity);
        if (targetRank === entityRank) {
          if (targetScore < entityScore) {
            continue;
          }
        }
        target = entity;
        targetScore = entityScore;
      }
    }

    if (target !== null) {
      const delta = Vec3.delta(this.position, target.position);
      const distance = delta.length();
      const speed = this.velocity.length();
      if (speed < 0.1) {
        this.velocity.inplaceScaleAdd(timeDelta / 40_000, delta);
      } else {
        const dot = this.velocity.dot(delta) / speed / distance;
        if (dot <= 0 || speed > (slicing ? 10 : 4)) {
          this.velocity.inplaceScale(0.3);
        } else {
          const mirrorVelocity = Vec3.a.setScale(-2, this.velocity).inplaceScaleAdd(2 * speed / distance, delta);
          const offsetDelta = Vec3.b.setScaleAdd(delta, 100, mirrorVelocity);
          if (target.velocity) {
            offsetDelta.inplaceScaleAdd(500, target.velocity);
          }
          this.velocity.inplaceScaleAdd(timeDelta / 20_000, offsetDelta);
        }
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

function getEntityRank(game, entity) {
  if (entity === null) {
    return 0;
  }

  if (!entity.position) {
    return 0;
  }

  const inside = Math.abs(entity.position.x) < game.width / 2
    && Math.abs(entity.position.y) < game.height / 2;
  if (!inside) {
    return 0;
  }

  if (entity instanceof Balloon) {
    if (entity.type === 'normal') {
      if (entity.radius > 50) {
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