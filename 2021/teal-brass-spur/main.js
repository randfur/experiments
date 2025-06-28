import {rootSpawn} from './spawn.js';
import {range, random, randomHigh, randomMid, deviate} from './utils.js';
import {width, height, initDrawing, draw, stainContext} from './drawing.js';

async function star() {
  const maxSize = Math.round(random(3));
  let size = 0;
  const {
    headColour,
    trailColour,
    stepWait,
    stepSize,
  } = random(1) > 0.5 ? {
    headColour: '#fff8',
    trailColour: `hsla(${this.hue}deg, 100%, ${50 + 50 * (random(1) < 0.9)}%, ${0.1 + size * 0.1})`,
    stepWait: 0.5 + random(1),
    stepSize: 2,
  } : {
    headColour: '#ff00000c',
    trailColour: '#000',
    stepWait: 0,
    stepSize: 1,
  };
  let x = random(width);
  let y = random(height);
  
  this.register(draw(context => {
    const drawX = Math.round(x);
    const drawY = Math.round(y);
    context.fillStyle = headColour;
    context.fillRect(drawX - size, drawY, 2 * size + 1, 1);
    context.fillRect(drawX, drawY - size, 1, 2 * size + 1);
    if (size >= 2) {
      context.fillRect(drawX - 1, drawY - 1, 3, 3);
    }
  }));

  while (size < maxSize) {
    size += 0.1;
    await this.sleep();
  }
  
  this.spawn({ async run() {
    while (true) {
      await this.sleep(randomMid(stepWait));

      const oldX = x;
      const oldY = y;
      const dx = deviate(stepSize * (size + 1));
      const dy = deviate(stepSize * (size + 1));

      stainContext.strokeStyle = trailColour;
      stainContext.beginPath();
      stainContext.moveTo(oldX, oldY);
      stainContext.lineTo(oldX + dx, oldY + dy);
      stainContext.stroke();

      for (const stage of [0.5, 0.8, 0.95, 1]) {
        x = oldX + dx * stage;
        y = oldY + dy * stage;
        await this.sleep();
      }
    }
  }});
  
  await this.sleep(20 + random(10));

  while (size > 0) {
    size -= 0.5;
    await this.sleep();
  }
}

async function main() {
  initDrawing();

  rootSpawn({ async run() {
    let hue = random(360);

    this.spawn({ async run() {
      while (true) {
        await this.sleep(2 * 60);
        hue = random(360);
      }
    }});

    while (true) {
      this.spawn({ hue, run: star });
      await this.sleep(0.25);
    }
  }});
}

main();