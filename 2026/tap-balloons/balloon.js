import {Vec3} from '../../third-party/ga/vec3.js';

export class Balloon {
  static maxRadius = 50;
  static maxDrift = 10;

  constructor(game, position, colour) {
    this.alive = true;
    this.position = position;
    this.growRemaining = growDuration;
    this.hangRemaining = hangDuration;
    this.fadeRemaining = fadeDuration;
    this.scale = 0;
    this.colour = colour;
    this.driftXFrequency = Math.random() / 600;
    this.driftYFrequency = Math.random() / 600;
    this.driftXPhase = Math.random() * TAU;
    this.driftYPhase = Math.random() * TAU;
    this.rotateFrequency = Math.random() / 400;
    this.rotatePhase = Math.random() * TAU;
    this.rotateBase = Math.random() * 0.1;
    this.rotateAmplitude = 0.05 + Math.random() * 0.2;
    this.time = 0;
  }

  update(time, timeDelta) {
    this.time = time;
    if (this.growRemaining > 0) {
      --this.growRemaining;
    } else if (this.hangRemaining > 0) {
      --this.hangRemaining;
    } else {
      --this.fadeRemaining;
    }
    this.alive &&= this.fadeRemaining > 0;
  }

  draw(hexLines, textContext) {
    const growProgress = this.growRemaining > 0 ? easeOut(1 - (this.growRemaining / growDuration)) : 1;
    drawBalloon(
      hexLines,
      Vec3.addXyz(
        this.position,
        Balloon.maxDrift * growProgress * Math.cos(this.time * this.driftXFrequency + this.driftXPhase),
        Balloon.maxDrift * growProgress * Math.sin(this.time * this.driftYFrequency + this.driftYPhase),
      ),
      this.colour,
      Balloon.maxRadius * growProgress,
      this.rotateBase + this.rotateAmplitude * Math.sin(this.time * this.rotateFrequency + this.rotatePhase),
      easeOut(this.fadeRemaining / fadeDuration),
    );
  }
}

const drawVec3 = new Vec3();
export function drawBalloon(hexLines, position, colour, scale, rotation, fade) {
  const fadedColour = fadeColour(colour, fade);
  for (const point of balloonModelPoints) {
    hexLines.addPointParts(
      drawVec3
        .set(point)
        .inplaceScale(scale)
        .inplaceRotateXyAngle(rotation)
        .inplaceAdd(position),
      4,
      fadedColour,
    );
  }
  hexLines.addNull();

  const fadedWhite = fadeColour(white, fade);
  for (const point of shineModelPoints) {
    hexLines.addPointParts(
      drawVec3
        .set(point)
        .inplaceScale(scale)
        .inplaceRotateXyAngle(rotation)
        .inplaceAdd(position),
      4,
      fadedWhite,
    );
  }
  hexLines.addNull();
}

const TAU = Math.PI * 2;

const growDuration = 100;
const hangDuration = 100;
const fadeDuration = 50;

const drawingScale = 1 / 34;
const balloonModelPoints = [
  new Vec3(-2, -34),
  new Vec3(12, -22),
  new Vec3(22, -3),
  new Vec3(23, 17),
  new Vec3(12, 32),
  new Vec3(-12, 33),
  new Vec3(-25, 21),
  new Vec3(-28, 4),
  new Vec3(-27, -8),
  new Vec3(-13, -26),
  new Vec3(-2, -34),
  new Vec3(6, -46),
  new Vec3(-12, -44),
  new Vec3(-2, -34),
].map(point => point.inplaceScale(drawingScale));

const shineModelPoints = [
  new Vec3(-18, 5),
  new Vec3(-14, 13),
  new Vec3(-10, 17),
  new Vec3(-3, 21),
  new Vec3(-9, 25),
  new Vec3(-16, 19),
  new Vec3(-18, 5),
].map(point => point.inplaceScale(drawingScale));

const white = {r: 255, g: 255, b: 255};
const returnColour = {r: 0, g: 0, b: 0};
function fadeColour(colour, fade) {
  returnColour.r = colour.r * fade;
  returnColour.g = colour.g * fade;
  returnColour.b = colour.b * fade;
  return returnColour;
}

function deviate(x) {
  return Math.random() * 2 * x - x;
}

function easeOut(x) {
  return 1 - (1 - x) ** 2;
}
