import {Balloon} from './balloon.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Star} from './star.js';
import {Cross} from './cross.js';
import {stageBlue, stageGreen, stageYellow, stageRed, white, goodStarColour, badStarColour} from './colours.js';
import {FlightSquad} from './flight-squad.js';
import {Snake} from './snake.js';
import {hudModels} from './model-data.js';
import {cleanUpList, deviate, drawModel, drawString} from './utils.js';

export class Game {
  constructor(entities, width, height) {
    this.alive = true;
    this.entities = entities;
    this.width = width;
    this.height = height;
    this.highScore = 0;
    this.reset();
    window.addEventListener('pointerdown', event => {
      this.click(this.pointerEventToPosition(event));
    });
    window.addEventListener('pointermove', event => {
      this.pointerMove(this.pointerEventToPosition(event));
    });
  }

  pointerEventToPosition(event) {
    return new Vec3(event.clientX - this.width / 2, -(event.clientY - this.height / 2));
  }

  reset() {
    this.stageIndex = -1;
    this.stage = null;
    this.stageRemaining = 0;
    this.colour = null;
    this.score = 0;
    this.popCheck = false;
    this.comboRemaining = 0;
    this.comboLevel = 0;
    this.spawnDelayRemaining = 0;
    this.wobbleSources = [];
    for (const entity of this.entities) {
      if (entity !== this) {
        entity.alive = false;
      }
    }
  }

  update(time, timeDelta) {
    this.stageRemaining -= timeDelta;
    if (this.stageRemaining <= 0) {
      ++this.stageIndex;
      if (this.stageIndex >= stages.length) {
        if (Math.abs(this.score) > Math.abs(this.highScore)) {
          this.highScore = this.score;
        }
        this.reset();
        return;
      }

      this.stageRemaining = stageDuration;
      this.stage = stages[this.stageIndex];
      if (this.stage.special) {
        this.entities.push(new this.stage.special(this));
      }
    }

    this.comboRemaining -= timeDelta;
    if (this.comboRemaining <= 0) {
      this.comboLevel = 0;
    }

    this.spawnDelayRemaining -= timeDelta;
    if (this.spawnDelayRemaining <= 0) {
      this.spawnDelayRemaining = spawnDelayDuration;
      let balloons = this.stage.spawnChance;
      while (balloons > 0) {
        if (Math.random() < balloons) {
          this.maybeAddBalloon();
        }
        --balloons;
      }
    }

    for (const wobbleSource of this.wobbleSources) {
      wobbleSource.remaining -= timeDelta;
    }
    cleanUpList(this.wobbleSources, wobbleSource => wobbleSource.remaining > 0);
  }

  maybeAddBalloon() {
    let hasCleanUp = false;
    let badCount = 0;
    for (const entity of this.entities) {
      if (entity instanceof Balloon) {
        hasCleanUp ||= entity.type === 'cleanUp';
        badCount += entity.type === 'bad' ? 1 : 0;
      }
    }
    const createCleanUp = !hasCleanUp && badCount >= 3;

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
          const squareDistance = Vec3.delta(entity.preWobblePosition, position).squareLength();
          if (squareDistance < (entity.maxRadius + maxRadius + Balloon.drift) ** 2) {
            collision = true;
            maxRadius *= 0.8;
            break;
          }
        }
      }
      if (!collision) {
        const bad = Math.random() < this.stage.badChance;
        this.entities.push(new Balloon(
          this,
          createCleanUp ? 'cleanUp' : (bad ? 'bad' : 'normal'),
          position,
          maxRadius,
          this.stage.colour,
        ));
        break;
      }
    }
  }

  incrementCombo() {
    this.comboLevel = Math.min(maxComboLevel, this.comboLevel + 1);
    this.comboRemaining = comboDuration;
  }

  clearCombo() {
    this.comboLevel = 0;
    this.comboRemaining = 0;
  }

  click(position) {
    this.popCheck = false;
    for (const entity of this.entities) {
      if (entity !== this && entity.alive) {
        entity.click?.(position);
      }
    }
    if (!this.popCheck) {
      this.entities.push(new Cross(position.clone()));
      this.comboLevel = 0;
    }
  }

  pointerMove(position) {
     for (const entity of this.entities) {
      if (entity !== this && entity.alive) {
        entity.pointerMove?.(position);
      }
    }
 }

  draw(hexLines) {
    Mat4
      .translateXyz(0, 0, 800)
      .exportToArrayBuffer(hexLines.transformMatrix);

    const textSize = 100;
    const textThickness = 10;
    const textY = this.height / 2 - 50;

    const numberSize = 40;
    const numberThickness = 10;
    const numberY = this.height / 2 - 90;

    const timeXOffset = 100;
    const comboXOffset = 140;
    const scoreXOffset = 100;
    const highScoreXOffset = 100;

    const columnWidth = this.width / 3;
    let x = -this.width / 2;

    const seconds = this.secondsRemaining();
    this.drawHudPart(hexLines, hudModels.time, `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`, x + 100);
    x += columnWidth;
    this.drawHudPart(hexLines, hudModels.combo, `${this.comboLevel}X`, x + 40);
    x += columnWidth;
    this.drawHudPart(hexLines, hudModels.score, `${this.score}`, x - 40);
    x += columnWidth;
    this.drawHudPart(hexLines, hudModels.highScore, `${this.highScore}`, x - 100);
    x += columnWidth;
  }

  drawHudPart(hexLines, model, string, x) {
    const colour = this.comboLevel === maxComboLevel ? goodStarColour : badStarColour;
    drawModel(hexLines, model, 10, colour, position => {
      return Vec3
        .set(position)
        .inplaceScale(100)
        .inplaceAddXyz(x, this.height / 2 - 50);
    });
    drawString(hexLines, string, 10, colour, position => {
      return Vec3
        .set(position)
        .inplaceScale(30)
        .inplaceAddXyz(x, this.height / 2 - 140);
    });
  }

  secondsRemaining() {
    return Math.ceil((this.stageRemaining + (stages.length - 1 - this.stageIndex) * stageDuration) / 1000);
  }
}

const stageDuration = 15000;
const maxComboLevel = 10;
const comboDuration = 800;
const maxBalloonRadius = 150;
const spawnDelayDuration = 10;

const stages = [{
  colour: stageBlue,
  spawnChance: 0.07,
  badChance: 0,
}, {
  colour: stageGreen,
  spawnChance: 0.1,
  badChance: 0.2,
}, {
  colour: stageYellow,
  spawnChance: 0.4,
  badChance: 0.3,
  special: FlightSquad,
}, {
  colour: stageRed,
  spawnChance: 5,
  badChance: 0.4,
  special: Snake,
}];
