const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');
const tree = null;

function createNode(value) {
  return {
    value,
    colour: 'black',
    left: null,
    right: null,
  };
}

function init() {
  canvas.width = width;
  canvas.height = height;
  tree = createNode(0);
}

function update() {
  
}

async function main() {
  init();
  while (true) {
    await new Promise(requestAnimationFrame);
    update();
    draw();
  }
}

main();