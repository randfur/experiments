import {random, deviate} from './utils/random.js';
import {getSketches, drawSketching} from './sketch.js';
import {bitmapToCollision} from './bitmap-to-collision.js';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');

const shapes = [];

async function main() {
  canvas.width = width;
  canvas.height = height;
  
  (async () => {
    for await (const sketch of getSketches()) {
      shapes.push({
        image: sketch,
        collision: bitmapToCollision(sketch),
        x: random(width),
        y: random(height),
        dx: deviate(0),
        dy: deviate(0),
      });
    }
  })();
  
  while (true) {
    await new Promise(requestAnimationFrame);

    for (const shape of shapes) {
      shape.x += shape.dx;
      shape.y += shape.dy;
    }
    
    draw();
  }
}

function draw() {
  context.clearRect(0, 0, width, height);

  for (const shape of shapes) {
    context.drawImage(shape.image, shape.x, shape.y);
  }
  
  drawSketching(context);
}

main();