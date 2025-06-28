// Inspired by: https://twitter.com/aemkei/status/1378106731386040322?s=19

const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');

function getState() {
  const [a, b] = location.hash.slice(1).split(',');
  return {
    mod: Number(a),
    rotate: Boolean(b),
  };
}

function setState({mod, rotate}) {
  location.hash = [mod, rotate ? 'r' : ''];
}

function randomiseMod() {
  const state = getState();
  state.mod = Math.ceil(Math.random() * 100);
  setState(state);
}

function hashNumber() {
  return Number(location.hash.slice(1));
}

function draw() {
  const {mod, rotate} = getState();
  modText.textContent = mod;
  context.clearRect(0, 0, width, height);
  context.fillStyle = 'white';
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      if (rotate) {
        const testX = (x + y) / 2;
        const testY = (y - x) / 2;
        if (testX % 1 != 0 || testY % 1 != 0) {
          continue;
        }
        if ((testX ^ testY) % mod == 0) {
          context.fillRect(x, y, 2, 2);
        }
      } else {
        if ((x ^ y) % mod == 0) {
          context.fillRect(x, y, 1, 1);
        }
      }
    }
  }
}

async function main() {
  canvas.width = width;
  canvas.height = height;
  
  addEventListener('click', event => {
    randomiseMod();
  });

  addEventListener('wheel', event => {
    const state = getState();
    state.mod -= Math.sign(event.deltaY);
    setState(state);
  });
  
  addEventListener('keydown', event => {
    if (event.key == 'r') {
      const state = getState();
      state.rotate ^= true;
      setState(state);
    }
  });

  addEventListener('hashchange', event => {
    draw();
  });

  if (!location.hash) {
    randomiseMod();
  } else {
    draw();
  }
}
main();