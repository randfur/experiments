import {Balloon} from './balloon.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Star} from './star.js';
import {Slicer} from './slicer.js';
import {Cross} from './cross.js';
import {Shrapnel} from './shrapnel.js';
import {white, black, stageBlue, stageGreen, stageYellow, stageRed, stageColours, goodStarColour, dullHud} from './colours.js';
import {FlightSquad} from './flight-squad.js';
import {Snake} from './snake.js';
import {hudModels} from './model-data.js';
import {TAU, easeIn, cleanUpList, random, deviate, randomBool, pickRandom, drawModel, drawString} from './utils.js';

export class Game {
  constructor(entities, width, height) {
    this.alive = true;
    this.entities = entities;
    this.width = width;
    this.height = height;

    this.gameOver = true;
    this.startCooldownRemaining = 0;

    this.score = 0;
    this.highScore = 0;

    this.resetQuestion = false;
    this.resetQuestionBarsRemaining = 0;

    this.stageIndex = null;
    this.stage = null;
    this.stageRemaining = 0;

    this.popCheck = false;
    this.comboRemaining = 0;
    this.comboLevel = 0;
    this.spawnDelayRemaining = 0;

    this.wobbleSources = [];

    window.addEventListener('pointerdown', event => {
      this.pointerDown(event);
    });

    window.addEventListener('pointermove', event => {
      this.pointerMove(this.pointerEventToPosition(event));
    });
  }

  pointerEventToPosition(event) {
    return new Vec3(event.clientX - this.width / 2, -(event.clientY - this.height / 2));
  }

  pointerDown(event) {
    switch (event.button) {
    case 0:
      if (this.gameOver) {
        if (this.startCooldownRemaining <= 0) {
          this.start();
        }
      } else if (this.resetQuestion) {
        this.start();
      } else {
        this.click(this.pointerEventToPosition(event));
      }
      break;
    case 2:
      if (this.gameOver) {
        break;
      } else if (!this.resetQuestion) {
        this.resetQuestion = true;
        this.resetQuestionBarsRemaining = resetQuestionBarsDuration;
      } else {
        this.resetQuestion = false;
      }
      break;
    }
  }

  start() {
    this.gameOver = false;
    this.stageIndex = -1;
    this.stage = null;
    this.stageRemaining = 0;
    this.score = 0;
    this.resetQuestion = false;
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

  endGame() {
    this.gameOver = true;
    this.resetQuestion = false;
    this.startCooldownRemaining = startCooldownDuration;

    for (const entity of this.entities) {
      if (entity instanceof Balloon) {
        entity.pop(/*directClick=*/false, /*scoresPoints=*/false);
      } else if (entity instanceof Slicer) {
        entity.alive = false;
      }
    }

    for (let i = 0; i < 500; ++i) {
      this.entities.push(
        new Shrapnel(
          new Vec3(-this.width / 2, this.height / 2),
          new Vec3(-this.width / 2 - random(100), this.height / 2),
          new Vec3(random(2), random(-2), random(-3)),
          10,
          randomBool() ? stageRed : white,
        ),
      );
    }
  }

  update(time, timeDelta) {
    if (this.gameOver) {
      this.startCooldownRemaining -= timeDelta;
      let balloonCount = 0;
      for (const entity of this.entities) {
        if (entity instanceof Balloon) {
          ++balloonCount;
        }
      }
      if (balloonCount === 0) {
        this.entities.push(new Balloon(
          this,
          Math.random() < 0.1 ? 'bad' : 'normal',
          new Vec3(deviate(this.width / 2), deviate(this.height / 2)),
          maxBalloonRadius,
          pickRandom(stageColours),
        ));
      }
      if (this.score > 0 && this.score === this.highScore) {
        for (let i = this.startCooldownRemaining / 500; i > 0; --i) {
          this.entities.push(new Star(
            this,
            new Vec3().setXyz(deviate(this.width / 2), -this.height / 2),
            this.startCooldownRemaining / 200,
            /*bad=*/false,
          ));
        }
      }
      return;
    }

    this.stageRemaining -= timeDelta;
    if (this.stageRemaining <= 0) {
      ++this.stageIndex;
      if (this.stageIndex >= stages.length) {
        if (Math.abs(this.score) > Math.abs(this.highScore)) {
          this.highScore = this.score;
        }
        this.endGame();
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

    this.resetQuestionBarsRemaining = Math.max(0, this.resetQuestionBarsRemaining - timeDelta);
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
    let attemptsLeft = 10;
    let maxRadius = maxBalloonRadius;
    while (attemptsLeft > 0) {
      --attemptsLeft;
      let collision = false;
      for (const entity of this.entities) {
        if (entity instanceof Balloon) {
          const squareDistance = Vec3.delta(entity.preWobblePosition, position).squareLength();
          if (squareDistance < (entity.maxRadius + maxRadius + Balloon.drift) ** 2) {
            collision = true;
            maxRadius *= 0.95;
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
    if (this.gameOver) {
      return;
    }
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

    if (this.gameOver) {
      drawString(hexLines, 'TAP BALLOONS', 10, white, position => {
        return Vec3.set(position).inplaceScale(60).inplaceAddXyz(0, this.height / 2 - 200);
      });
      const rowHeight = 150;
      let y = rowHeight;
      const scoreColour = this.score > 0 && this.score === this.highScore ? goodStarColour : dullHud;
      drawString(hexLines, `SCORE: ${this.score}`, 15, scoreColour, position => {
        return Vec3.set(position).inplaceScale(50).inplaceAddXyz(0, y);
      });
      y -= rowHeight;
      drawString(hexLines, `HIGH: ${this.highScore}`, 15, scoreColour, position => {
        return Vec3.set(position).inplaceScale(50).inplaceAddXyz(0, y);
      });
      y -= rowHeight;
      if (this.startCooldownRemaining <= 0) {
        drawString(hexLines, `<TAP TO START>`, 10, dullHud, position => {
          return Vec3.set(position).inplaceScale(30).inplaceAddXyz(0, y);
        });
      }
      return;
    }

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

    if (this.stageIndex === stages.length - 1) {
      const secondsRemaining = this.stageRemaining / 1000;
      const timerPressureStart = 5;
      const pressureProgress = 1 - secondsRemaining / timerPressureStart;
      if (secondsRemaining < timerPressureStart) {
        const spokes = 6;
        for (let i = 0; i < spokes; ++i) {
          hexLines.addPointParts(
            Vec3.polar(
              -TAU / 4 * i / (spokes - 1),
              Math.max(this.width, this.height) * Math.sqrt(2) * ((secondsRemaining % 1) ** (2 * pressureProgress + 1)),
            ).inplaceAddXyz(-this.width / 2, this.height / 2),
            50,
            white,
          );
        }
        hexLines.addNull();
      }
    }

    if (this.resetQuestion) {
      drawString(hexLines, 'RESTART?', 10, white, position => {
        return Vec3
          .set(position)
          .inplaceScale(50);
      });

      const barProgress = 1 - this.resetQuestionBarsRemaining / resetQuestionBarsDuration;
      const barThickness = 100;
      const barLength = this.width + this.height;

      let up = true;
      for (let x = -barLength; x < barLength; x += barThickness * 2) {
        hexLines.addPointParts(
          Vec3.xyz(
            x,
            (this.height / 2) * (up ? -1 : 1),
          ),
          barThickness,
          black,
        );
        hexLines.addPointParts(
          Vec3.xyz(
            x + barLength * barProgress,
            (this.height / 2 - barLength * barProgress) * (up ? -1 : 1),
          ),
          barThickness,
          this.stage.colour,
        );
        hexLines.addNull();
        up = !up;
      }
    }
  }

  drawHudPart(hexLines, model, string, x) {
    const colour = this.comboLevel === maxComboLevel ? goodStarColour : dullHud;
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

const startCooldownDuration = 2000;
const stageDuration = 15000;
const maxComboLevel = 10;
const comboDuration = 800;
const maxBalloonRadius = 150;
const spawnDelayDuration = 10;
const resetQuestionBarsDuration = 1000;

const stages = [{
  colour: stageBlue,
  spawnChance: 0.08,
  badChance: 0.0,
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
  spawnChance: 10,
  badChance: 0.3,
  special: Snake,
}];
