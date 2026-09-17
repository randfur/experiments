import {Balloon} from './balloon.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {StarEmitter} from './star-emitter.js';
import {Star} from './star.js';
import {Cross} from './cross.js';
import {deviate, drawModel} from './utils.js';

export class Game {
  constructor(entities, width, height) {
    this.alive = true;
    this.entities = entities;
    this.width = width;
    this.height = height;
    this.highScore = 0;
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
    this.stageRemaining -= timeDelta;
    if (this.stageRemaining <= 0) {
      ++this.stageIndex;
      if (this.stageIndex >= stages.length) {
        this.reset();
        for (const entity of this.entities) {
          if (entity !== this) {
            entity.alive = false;
          }
        }
        return;
      }
      this.stageRemaining = 5000;
      this.stage = stages[this.stageIndex];
    }

    this.comboRemaining -= timeDelta;
    if (this.comboRemaining <= 0) {
      this.comboLevel = 0;
    }

    let balloons = this.stage.chance;
    while (balloons > 0) {
      if (Math.random() < balloons) {
        this.maybeAddBalloon();
      }
      --balloons;
    }
  }

  click(position) {
    let pop = false;
    for (const entity of this.entities) {
      if (entity.alive && entity instanceof Balloon) {
        const squareDistance = Vec3.delta(entity.position, position).squareLength();
        if (squareDistance < entity.radius ** 2) {
          entity.pop();
          this.comboLevel = Math.min(maxComboLevel, this.comboLevel + 1);
          this.comboRemaining = comboDuration;
          this.entities.push(new StarEmitter(this, position.clone(), entity.radius, this.comboLevel));
          pop = true;
          break;
        }
      }
    }
    if (!pop) {
      this.entities.push(new Cross(position.clone()));
      this.comboLevel = 0;
    }
  }

  maybeAddBalloon() {
    const position = new Vec3(
      deviate(this.width / 2 - maxBalloonRadius),
      deviate(this.height / 2 - maxBalloonRadius),
    );
    let attemptsLeft = 5;
    let maxRadius = maxBalloonRadius;
    while (attemptsLeft > 0) {
      --attemptsLeft;
      let collision = false;
      for (const entity of this.entities) {
        if (entity instanceof Balloon) {
          const squareDistance = Vec3.delta(entity.position, position).squareLength();
          if (squareDistance < (entity.maxRadius + maxRadius) ** 2) {
            collision = true;
            maxRadius *= 0.8;
            break;
          }
        }
      }
      if (!collision) {
        this.entities.push(new Balloon(this, position, maxRadius, this.stage.colour));
        break;
      }
    }
  }

  draw(hexLines, textContext) {
    const wordsY = this.height / 2 - 50;
    const numberY = 130;
    textContext.font = '60px impact';
    textContext.fillStyle = 'white';
    textContext.textAlign = 'center';

    drawModel(hexLines, highModelPoints, 10, white, point => {
      return Vec3.set(point).inplaceScale(100).inplaceAddXyz(-this.width / 2 + 100, wordsY);
    });
    textContext.fillText(this.highScore, 100, numberY);

    drawModel(hexLines, scoreModelPoints, 10, white, point => {
      return Vec3.set(point).inplaceScale(100).inplaceAddXyz(0, wordsY);
    });
    textContext.fillText(this.score, this.width / 2, numberY);

    drawModel(hexLines, comboModelPoints, 10, white, point => {
      return Vec3.set(point).inplaceScale(100).inplaceAddXyz(this.width / 2 - 140, wordsY);
    });
    textContext.fillText(`${this.comboLevel} X`, this.width - 140, numberY);
  }
}

const maxComboLevel = 10;
const maxBalloonRadius = 80;
const comboDuration = 600;
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

const white = {r: 255, g: 255, b: 255};

const scoreModelPoints = [
  new Vec3(0.02, 0.23),
  new Vec3(-0.21, 0.18),
  new Vec3(-0.27, -0.07),
  new Vec3(-0.03, -0.20),
  new Vec3(0.17, -0.09),
  new Vec3(0.14, 0.12),
  new Vec3(0.03, 0.23),
  null,
  new Vec3(0.32, -0.24),
  new Vec3(0.33, 0.26),
  new Vec3(0.55, 0.23),
  new Vec3(0.60, 0.09),
  new Vec3(0.34, 0.00),
  new Vec3(0.54, -0.20),
  null,
  new Vec3(0.86, 0.23),
  new Vec3(0.72, 0.24),
  new Vec3(0.72, 0.02),
  new Vec3(0.84, 0.02),
  new Vec3(0.72, 0.03),
  new Vec3(0.72, -0.25),
  new Vec3(0.85, -0.22),
  null,
  new Vec3(0.98, -0.15),
  new Vec3(0.98, -0.14),
  null,
  new Vec3(0.98, 0.11),
  new Vec3(0.98, 0.11),
  null,
  new Vec3(-0.39, 0.26),
  new Vec3(-0.51, 0.32),
  new Vec3(-0.71, 0.26),
  new Vec3(-0.73, -0.09),
  new Vec3(-0.55, -0.25),
  new Vec3(-0.40, -0.15),
  null,
  new Vec3(-0.84, 0.19),
  new Vec3(-0.96, 0.29),
  new Vec3(-1.11, 0.26),
  new Vec3(-1.11, 0.08),
  new Vec3(-1.03, 0.04),
  new Vec3(-0.89, -0.00),
  new Vec3(-0.86, -0.13),
  new Vec3(-0.93, -0.22),
  new Vec3(-1.10, -0.21),
  new Vec3(-1.17, -0.13),
  null,
];

const comboModelPoints = [
  new Vec3(-0.66, 0.16),
  new Vec3(-0.82, 0.23),
  new Vec3(-1.00, 0.14),
  new Vec3(-1.03, -0.11),
  new Vec3(-0.88, -0.27),
  new Vec3(-0.70, -0.22),
  null,
  new Vec3(-0.45, -0.25),
  new Vec3(-0.56, -0.11),
  new Vec3(-0.54, 0.13),
  new Vec3(-0.36, 0.21),
  new Vec3(-0.22, 0.01),
  new Vec3(-0.24, -0.18),
  new Vec3(-0.44, -0.24),
  null,
  new Vec3(-0.13, -0.22),
  new Vec3(-0.07, 0.24),
  new Vec3(0.02, 0.00),
  new Vec3(0.14, 0.25),
  new Vec3(0.17, -0.21),
  null,
  new Vec3(0.29, -0.22),
  new Vec3(0.30, 0.25),
  new Vec3(0.45, 0.25),
  new Vec3(0.56, 0.08),
  new Vec3(0.41, -0.03),
  new Vec3(0.50, -0.14),
  new Vec3(0.46, -0.25),
  new Vec3(0.30, -0.23),
  null,
  new Vec3(0.82, -0.24),
  new Vec3(0.65, -0.08),
  new Vec3(0.65, 0.13),
  new Vec3(0.71, 0.31),
  new Vec3(0.89, 0.31),
  new Vec3(0.99, 0.09),
  new Vec3(0.93, -0.13),
  new Vec3(0.84, -0.23),
  null,
  new Vec3(1.09, -0.12),
  new Vec3(1.09, -0.12),
  null,
  new Vec3(1.10, 0.21),
  new Vec3(1.10, 0.21),
  null,
];

const highModelPoints = [
  new Vec3(-0.77, 0.25),
  new Vec3(-0.59, 0.27),
  null,
  new Vec3(-0.68, 0.26),
  new Vec3(-0.68, -0.20),
  null,
  new Vec3(-0.75, -0.21),
  new Vec3(-0.62, -0.19),
  null,
  new Vec3(-0.68, 0.03),
  new Vec3(-0.44, 0.05),
  null,
  new Vec3(-0.48, 0.25),
  new Vec3(-0.39, 0.26),
  null,
  new Vec3(-0.44, 0.26),
  new Vec3(-0.44, -0.20),
  null,
  new Vec3(-0.51, -0.19),
  new Vec3(-0.39, -0.21),
  null,
  new Vec3(-0.25, 0.25),
  new Vec3(-0.15, 0.29),
  null,
  new Vec3(-0.20, 0.27),
  new Vec3(-0.21, -0.19),
  null,
  new Vec3(-0.28, -0.18),
  new Vec3(-0.15, -0.22),
  null,
  new Vec3(0.24, 0.14),
  new Vec3(0.17, 0.27),
  new Vec3(-0.00, 0.29),
  new Vec3(-0.10, 0.08),
  new Vec3(-0.04, -0.12),
  new Vec3(0.07, -0.18),
  new Vec3(0.22, -0.12),
  new Vec3(0.24, -0.02),
  new Vec3(0.10, -0.02),
  null,
  new Vec3(0.37, -0.18),
  new Vec3(0.45, -0.19),
  null,
  new Vec3(0.41, -0.18),
  new Vec3(0.41, 0.26),
  null,
  new Vec3(0.36, 0.25),
  new Vec3(0.48, 0.28),
  null,
  new Vec3(0.42, 0.02),
  new Vec3(0.59, 0.03),
  null,
  new Vec3(0.56, 0.26),
  new Vec3(0.63, 0.29),
  null,
  new Vec3(0.59, 0.28),
  new Vec3(0.59, -0.19),
  null,
  new Vec3(0.52, -0.19),
  new Vec3(0.64, -0.19),
  null,
  new Vec3(0.76, 0.14),
  new Vec3(0.76, 0.14),
  null,
  new Vec3(0.78, -0.07),
  new Vec3(0.78, -0.07),
  null,
];