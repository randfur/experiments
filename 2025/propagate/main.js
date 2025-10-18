import {TestMode} from './test-mode.js';

async function main() {
  document.body.style.cssText = `
    background-color: black;
    padding: 0;
    margin: 0;
    overflow: hidden;
  `;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  document.body.append(canvas);

  const mode = new TestMode(width, height);

  window.addEventListener('pointermove', event => mode.move(event.offsetX, event.offsetY));
  window.addEventListener('pointerdown', event => mode.click(event.offsetX, event.offsetY));
  window.addEventListener('keydown', event => {
    if (event.keyCode === 'KeyD') {
      mode.debug ^= true;
    }
  });

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    mode.update();
    mode.draw(context);
  }
}

main();
