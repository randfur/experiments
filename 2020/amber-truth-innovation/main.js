import {Tail} from './tail.js';
import {width, height, context, toggleDebug} from './utils.js';

let tails = null;

main();
async function main() {
  init();
  while (true) {
    const time = await nextFrame();
    update(time);
    render();
  }
}

function init() {
  tails = [
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
    new Tail(),
  ];
  
  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('keypress', event => {
    if (event.key == 'd') {
      toggleDebug();
    }
  });
}

function pointerMove(event) {
  tails[0].setPos({
    x: event.clientX,
    y: event.clientY,
  });
}

async function nextFrame() {
  return new Promise(requestAnimationFrame);
}

function update(time) {
  let lastTail = null;
  for (const tail of tails) {
    if (lastTail) {
      tail.setPos(lastTail.end());
    }
    tail.update(time);
    lastTail = tail;
  }
}

function render() {
  context.clearRect(0, 0, width, height);
  for (const tail of tails) {
    tail.render();
  }
}
