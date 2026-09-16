import {Balloon} from './balloon.js';
import {Vec3} from '../../third-party/ga/vec3.js';

export class Game {
  constructor(entities, width, height) {
    this.alive = true;
    this.entities = entities;
    this.width = width;
    this.height = height;
    this.reset();
    window.addEventListener('pointerdown', event => {
      this.click(new Vec3(event.offsetX - width / 2, -(event.offsetY - height / 2)));
    });
  }

  reset() {
    this.stageIndex = -1;
    this.stage = null;
    this.stageRemaining = 0;
    this.colour = null;
    this.score = 0;
    this.comboRemaining = 0;
    this.comboLevel = 0;
  }

  update(time, timeDelta) {
    --this.stageRemaining;
    if (this.stageRemaining <= 0) {
      ++this.stageIndex;
      if (this.stageIndex >= stages.length) {
        this.stageIndex = 0;
      }
      this.stageRemaining = 1000;
      this.stage = stages[this.stageIndex];
    }

    --this.comboRemaining;
    if (this.comboRemaining <= 0) {
      this.comboLevel = 0;
    }

    let balloons = this.stage.chance;
    while (balloons > 1) {
      --balloons;
      this.maybeAddBalloon();
    }
    if (Math.random() < balloons) {
      this.maybeAddBalloon();
    }
  }

  click(position) {
    let pop = false;
    for (const entity of this.entities) {
      if (entity.alive && entity instanceof Balloon) {
        const squareDistance = Vec3.delta(entity.position, position).squareLength();
        if (squareDistance < Balloon.maxRadius ** 2) {
          entity.alive = false;
          this.comboLevel = Math.min(maxComboLevel, this.comboLevel + 1);
          this.comboRemaining = comboDuration;
          this.score += Math.max(1, this.comboLevel);
          console.log(this.score);
          pop = true;
          break;
        }
      }
    }
    if (!pop) {
      this.comboLevel = 0;
    }
  }

  maybeAddBalloon() {
    const position = new Vec3(
      deviate(this.width / 2 - Balloon.maxRadius),
      deviate(this.height / 2 - Balloon.maxRadius),
    );
    let collision = false;
    for (const entity of this.entities) {
      if (entity instanceof Balloon) {
        const squareDistance = Vec3.delta(entity.position, position).squareLength();
        if (squareDistance < (Balloon.maxRadius * 2) ** 2) {
          collision = true;
          break;
        }
      }
    }
    if (!collision) {
      this.entities.push(new Balloon(this, position, this.stage.colour));
    }
  }

  draw(hexLines, textContext) {
  }
}

const maxComboLevel = 3;
const comboDuration = 50;
const stages = [{
  colour: {r: 255, g: 20, b: 10},
  chance: 0.06,
}, {
  colour: {r: 20, g: 50, b: 255},
  chance: 0.1,
}, {
  colour: {r: 255, g: 190, b: 20},
  chance: 0.5,
}, {
  colour: {r: 20, g: 220, b: 10},
  chance: 5,
}];

function deviate(x) {
  return Math.random() * 2 * x - x;
}
