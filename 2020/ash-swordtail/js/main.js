import {TAU, randBool, randInt} from './utils.js';
import {Canvas} from './canvas.js';
import {Config} from './config.js';
import {Grids} from './grids.js';

function main() {
  Canvas.setup();
  Grids.setup();

  registerEvents();
  
  requestAnimationFrame(frame);
}

function registerEvents() {
  Canvas.element.addEventListener('click', Grids.setup);
  window.addEventListener('keypress', Grids.setup);

  window.addEventListener('resize', () => {
    Canvas.setup();
    Grids.setup();
  });

  window.addEventListener('touchmove', event => event.preventDefault());

  window.addEventListener('pointermove', event => {
    event.preventDefault();
    let {clientX, clientY} = event;
    const cursorX = Math.round(clientX / Config.cellSize - 0.5);
    const cursorY = Math.round(clientY / Config.cellSize - 0.5);
    for (let repeat = 0; repeat < Config.cursorDots; ++repeat) {
      const angle = Math.random() * TAU;
      const radius = randInt(Config.cursorRadius);
      const x = Math.round(cursorX + Math.cos(angle) * radius);
      const y = Math.round(cursorY + Math.sin(angle) * radius);
      if (Grids.front.inBounds(x, y)) {
        if (randBool()) {
          Grids.front.setAlive(x, y, randBool());
        } else {
          Grids.back.setAlive(x, y, randBool());
        }
      }
    }
  })
}

function frame() {
  Grids.update();
  Grids.render();
  requestAnimationFrame(frame);
}

main();
