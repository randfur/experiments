import {Mat3} from './mat3.js';

const TAU = Math.PI * 2;

async function main() {
  canvas.width = 500;
  canvas.height = 500;
  const context = canvas.getContext('2d');

  let angle = 0;
  let mouse = {x: 0, y: 0};


  canvas.addEventListener('mousemove', event => {
    mouse.x = event.offsetX - canvas.width / 2;
    mouse.y = event.offsetY - canvas.height / 2;
  });

  while (true) {
    await new Promise(requestAnimationFrame);
    angle += 0.01;

    const cameraTransform = {
      origin: mouse,
      scale: {x: 0.5, y: 0.5},
      translate: {x: canvas.width / 2, y: canvas.height / 2},
    };

    const mat3 = new Mat3();
    mat3.applyToContext(context);
    context.clearRect(0, 0, 500, 500);

    context.strokeStyle = 'red';
    mat3.reset();
    mat3.applyTransformJson(cameraTransform);
    mat3.applyToContext(context);
    context.strokeRect(0, 0, 100, 100);

    context.strokeStyle = 'orange';
    mat3.reset();
    mat3.applyTransformJson(cameraTransform);
    mat3.applyTransformJson({origin: {x: 50, y: 50}});
    mat3.applyToContext(context);
    context.strokeRect(0, 0, 100, 100);

    context.strokeStyle = 'green';
    mat3.reset();
    mat3.applyTransformJson(cameraTransform);
    mat3.applyTransformJson({
      origin: {x: 50, y: 50},
      scale: {x: 2, y: 0.75},
    });
    mat3.applyToContext(context);
    context.strokeRect(0, 0, 100, 100);

    context.strokeStyle = 'blue';
    mat3.reset();
    mat3.applyTransformJson(cameraTransform);
    mat3.applyTransformJson({
      origin: {x: 50, y: 50},
      scale: {x: 2, y: 0.75},
      rotate: {x: Math.cos(angle), y: Math.sin(angle)},
    });
    mat3.applyToContext(context);
    context.strokeRect(0, 0, 100, 100);

    context.strokeStyle = 'purple';
    mat3.reset();
    mat3.applyTransformJson(cameraTransform);
    mat3.applyTransformJson({
      origin: {x: 50, y: 50},
      scale: {x: 2, y: 0.75},
      rotate: {x: Math.cos(angle), y: Math.sin(angle)},
      translate: {x: 200, y: 200},
    });
    mat3.applyToContext(context);
    context.strokeRect(0, 0, 100, 100);
  }
}

main();