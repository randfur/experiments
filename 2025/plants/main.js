import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';

let state = null;
let hexLinesContext = null;
let hexLines = null;
let camera = null;

async function main() {
  init();
  let lastTime = performance.now();
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    update(state, time - lastTime);
    lastTime = time;
    draw(state);
  }
}

function init() {
  ({hexLinesContext} = HexLinesContext.setupFullPageContext({
    is3d: true,
  }));

  hexLines = hexLinesContext.createLines();

  state = {
    plants: [createPlant({x: 0, y: 0, z: 1000})],
  };
}

function update(state, timeDelta) {
  for (const plant of state.plants) {
    updatePlant(plant);
  }
}

function draw(state) {
  hexLines.clear();

  for (const plant of state.plants) {
    drawPlant(plant);
  }

  hexLines.draw();
}

function createPlant(position) {
  const maxLife = 10000;
  return {
    life: maxLife,
    maxLife,
    growthRate: 10,
    root: createRoot(position),
    stem: createStem(position),
  };
}

function updatePlant(plant, timeDelta) {
  if (plant.life > 0) {
    const growth = timeDelta * plant.growthRate;
    plant.life = Math.max(plant.life - growth, 0);
    plant.root.growth += growth;
    plant.stem.growth += growth;
  }
}

function drawPlant(plant) {
  const fade = plant.life / plant.maxLife;
  drawRoot(plant.root, fade);
  drawStem(plant.stem, fade);
}

function createRoot(position) {
  return {
    growth: 0,
    nodes: [
      position,
      addY(position, -1),
    ],
    subRoots: [],
  };
}

function updateRoot(root) {

}

function addY(position, y) {
  return {
    x: position.x,
    y: position.y + y,
    z: position.z,
  };
}

main();