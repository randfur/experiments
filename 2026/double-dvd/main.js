const blockSize = 32;
const blockSpeed = 3;
const blockTrailLength = 10;
const initialColourBlocks = 2;
const width = window.innerWidth;
const height = window.innerHeight;
const maxBlockCount = Math.min((width * height) / (blockSize ** 2) * 0.75, 2000);
const wallSize = 64;
const floorColour = '#436';
const wallColour = '#84a';
const collisionGridCellSize = 100;
const cooldownDuration = 60 * 2;
const colourTallyRenderWidth = 4;
const colourTallyRenderHeightScale = 1 / 4;

let blocks = null;
let walls = null;
let context = null;
let collisionGrid = null;
let winner = null;
let debug = false;
let colourTallies = [];

async function main() {
  setup();
  init();

  while (true) {
    await new Promise(requestAnimationFrame);
    update();
    render();
  }
}

function setup() {
  document.body.style.cssText = `
    padding: 0;
    margin: 0;
    background-color: black;
    overflow: hidden;
  `;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  context = canvas.getContext('2d');

  collisionGrid = new CollisionGrid(width, height, collisionGridCellSize);

  window.addEventListener('click', _ => debug ^= true);
}

function init() {
  winner = null;

  blocks = [
    ...createBlocks(
      initialColourBlocks,
      wallSize, width / 2 - blockSize,
      wallSize, height / 2 - blockSize,
      'red',
      'darkred',
    ),
    ...createBlocks(
      initialColourBlocks,
      width / 2, width - wallSize,
      wallSize, height / 2 - blockSize,
      'khaki',
      'darkkhaki',
    ),
    ...createBlocks(
      initialColourBlocks,
      width / 2, width - wallSize,
      height / 2, height - wallSize,
      'green',
      'darkgreen',
    ),
    ...createBlocks(
      initialColourBlocks,
      wallSize, width / 2 - blockSize,
      height / 2, height - wallSize,
      'blue',
      'darkblue',
    ),
  ];
  for (const block of blocks) {
    block.cooldownLeft = 0;
  }
  walls = [
    createWall(0, 0, wallSize, height),
    createWall(width - wallSize, 0, wallSize, height),
    createWall(0, 0, width, wallSize),
    createWall(0, height - wallSize, width, wallSize),

    createWallCentred(
      (wallSize + width / 2) / 2,
      (wallSize + height / 2) / 2,
      wallSize,
      wallSize,
    ),
    createWallCentred(
      (width / 2 + width - wallSize) / 2,
      (wallSize + height / 2) / 2,
      wallSize,
      wallSize,
    ),
    createWallCentred(
      (width / 2 + width - wallSize) / 2,
      (height / 2 + height - wallSize) / 2,
      wallSize,
      wallSize,
    ),
    createWallCentred(
      (wallSize + width / 2) / 2,
      (height / 2 + height - wallSize) / 2,
      wallSize,
      wallSize,
    ),
    createWallCentred(
      width / 2,
      height / 2,
      wallSize,
      height * 2 / 3,
    ),
    createWallCentred(
      width / 2,
      height / 2,
      width * 2 / 3,
      wallSize,
    ),
    createWallCentred(
      width / 2,
      height / 2,
      wallSize,
      wallSize,
    ),
  ];
}

function update() {
  const colourTally = {};
  collisionGrid.clear();
  const addBlocks = [];
  const removeBlocks = new Set();

  for (const block of blocks) {
    block.cooldownLeft = Math.max(block.cooldownLeft - 1, 0);

    block.lastCheckId = null;

    block.trail.push({x: block.x, y: block.y})
    while (block.trail.length > blockTrailLength) {
      block.trail.shift();
    }

    block.x += block.dx;
    block.y += block.dy;

    for (const wall of walls) {
      updateDxdy(block, testWallCollision(block, wall));
    }

    colourTally[block.fill] = (colourTally[block.fill] ?? 0) + 1;

    collisionGrid.addRect(block.x, block.y, block.x + blockSize, block.y + blockSize, block);

    if (!collisionGrid.inRange(block.x, block.y)) {
      removeBlocks.add(block);
    }
  }

  colourTallies.push(colourTally);
  while (colourTallies.length > width / colourTallyRenderWidth) {
    colourTallies.shift();
  }

  for (const block of blocks) {
    collisionGrid.forEachCollision(
      block.x,
      block.y,
      block.x + blockSize,
      block.y + blockSize,
      otherBlock => {
        if (block.id <= otherBlock.id || otherBlock.lastCheckId === block.id) {
          return;
        }
        otherBlock.lastCheckId = block.id;
        const collisionDxdy = testBlockCollision(block, otherBlock);
        if (collisionDxdy) {
          if (winner) {
            if (block.fill === winner && block.fill !== otherBlock.fill) {
              removeBlocks.add(otherBlock);
            } else if (otherBlock.fill === winner && block.fill !== otherBlock.fill) {
              removeBlocks.add(block);
            } else {
              updateDxdy(block, collisionDxdy);
              updateDxdy(otherBlock, oppositeDxdy(collisionDxdy));
            }
          } else if (block.fill === otherBlock.fill && block.cooldownLeft <= 0 && otherBlock.cooldownLeft <= 0) {
            const midX = Math.round((block.x + otherBlock.x) / 2);
            const midY = Math.round((block.y + otherBlock.y) / 2);
            if (collisionGrid.inRange(midX, midY) && collisionGrid.array[collisionGrid.getCellIndex(midX, midY)].length < (collisionGrid.cellSize ** 2) / (blockSize ** 2)) {
              removeBlocks.add(block);
              removeBlocks.add(otherBlock);
              addBlocks.push(
                createBlock(midX, midY, -blockSpeed, -blockSpeed, block.fill, block.trailFill),
                createBlock(midX + blockSize + 1, midY, blockSpeed, -blockSpeed, block.fill, block.trailFill),
                createBlock(midX, midY + blockSize + 1, -blockSpeed, blockSpeed, block.fill, block.trailFill),
                createBlock(midX + blockSize + 1, midY + blockSize + 1, blockSpeed, blockSpeed, block.fill, block.trailFill),
              );
            }
          } else {
            if (colourTally[block.fill] > colourTally[otherBlock.fill]) {
              removeBlocks.add(block);
            } else if (colourTally[block.fill] < colourTally[otherBlock.fill]) {
              removeBlocks.add(otherBlock);
            } else {
              updateDxdy(block, collisionDxdy);
              updateDxdy(otherBlock, oppositeDxdy(collisionDxdy));
            }
          }
        }
      },
    );
  }

  blocks = blocks.filter(block => !removeBlocks.has(block));
  for (const block of addBlocks) {
    blocks.push(block);
  }

  if (winner !== null) {
    if (Object.keys(colourTally).length === 1) {
      init();
    }
  } else if (blocks.length >= maxBlockCount) {
    let highestCount = 0;
    let highestColour = null;
    for (const colour in colourTally) {
      if (colourTally[colour] > highestCount) {
        highestCount = colourTally[colour];
        highestColour = colour;
      }
    }
    winner = highestColour;
  }
}

function render() {
  context.fillStyle = floorColour;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'black';
  context.lineWidth = 2;

  // Trails
  for (const block of blocks) {
    context.fillStyle = block.trailFill;
    for (let i = 0; i < block.trail.length; ++i) {
      const trailSize = blockSize * i / blockTrailLength;
      context.fillRect(
        block.trail[i].x + blockSize / 2 - trailSize / 2,
        block.trail[i].y + blockSize / 2 - trailSize / 2,
        trailSize,
        trailSize,
      );
    }
  }

  // Blocks
  for (const block of blocks) {
    const onCooldown = block.cooldownLeft > 0;
    context.fillStyle = onCooldown ? block.trailFill : block.fill;
    context.fillRect(block.x, block.y, blockSize, blockSize);
    context.strokeRect(block.x, block.y, blockSize, blockSize);
  }

  // Walls
  context.fillStyle = wallColour;
  for (const wall of walls) {
    context.fillRect(wall.x, wall.y, wall.width, wall.height);
    context.strokeRect(wall.x, wall.y, wall.width, wall.height);
  }

  // Colour tallies
  if (debug) {
    for (let i = 0; i < colourTallies.length; ++i) {
      const colourTally = colourTallies[i];
      let lastY = 0;
      let y = 0;
      for (const colour in colourTally) {
        lastY = y;
        y += colourTally[colour] * colourTallyRenderHeightScale;
        context.fillStyle = colour;
        context.fillRect(
          i * colourTallyRenderWidth,
          lastY,
          colourTallyRenderWidth,
          y - lastY,
        );
      }
    }
  }

  // Win text
  if (winner) {
    context.fillStyle = 'black';
    context.font = 'bold 200px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(winner.toUpperCase(), width / 2, height / 3);
    context.fillText('WINS!', width / 2, height * 2 / 3);
  }

  // Collision grid
  if (debug) {
    collisionGrid.render();
  }
}

function createBlock(x, y, dx, dy, fill, trailFill) {
  return {
    id: id++,
    lastCheckId: null,
    x,
    y,
    dx,
    dy,
    fill,
    trailFill,
    trail: [],
    cooldownLeft: cooldownDuration,
  };
}

let id = 0;
function createBlockRandomDirection(x, y, fill, trailFill) {
  return createBlock(
    x,
    y,
    blockSpeed * (Math.random() > 0.5 ? 1 : -1),
    blockSpeed * (Math.random() > 0.5 ? 1 : -1),
    fill,
    trailFill,
  );
}

function createBlocks(count, xMin, xMax, yMin, yMax, fill, trailFill) {
  const blocks = [];
  let attempts = 0;
  while (true) {
    const block = createBlockRandomDirection(
      randomRange(xMin, xMax),
      randomRange(yMin, yMax),
      fill,
      trailFill,
    );
    let collide = false;
    for (const otherBlock of blocks) {
      if (testBlockCollision(block, otherBlock) !== null) {
        collide = true;
        break;
      }
    }
    if (collide) {
      ++attempts;
      if (attempts < 100) {
        continue;
      }
    }
    blocks.push(block);
    if (blocks.length >= count) {
      break;
    }
  }
  return blocks;
}

function createWall(x, y, width, height) {
  return {x, y, width, height};
}

function createWallCentred(x, y, width, height) {
  return createWall(
    Math.round(x - width / 2),
    Math.round(y - height / 2),
    width,
    height,
  );
}

function randomRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function updateDxdy(block, collisionDxdy) {
  if (!collisionDxdy) {
    return;
  }

  if (collisionDxdy.dx !== 0) {
    if (block.dx > 0 !== collisionDxdy.dx > 0) {
      block.dx *= -1;
    }
  } else {
    if (block.dy > 0 !== collisionDxdy.dy > 0) {
      block.dy *= -1;
    }
  }
}

const leftDxdy = {dx: -1, dy: 0};
const rightDxdy = {dx: 1, dy: 0};
const topDxdy = {dx: 0, dy: -1};
const bottomDxdy = {dx: 0, dy: 1};

function oppositeDxdy(dxdy) {
  return dxdy === leftDxdy
    ? rightDxdy
    : dxdy === rightDxdy
      ? leftDxdy
      : dxdy === topDxdy
        ? bottomDxdy
        : topDxdy;
}

function testWallCollision(block, wall) {
  return testCollision(
    block.x,
    block.y,
    block.x + blockSize,
    block.y + blockSize,
    wall.x,
    wall.y,
    wall.x + wall.width,
    wall.y + wall.height,
  );
}

function testBlockCollision(blockA, blockB) {
  return testCollision(
    blockA.x,
    blockA.y,
    blockA.x + blockSize,
    blockA.y + blockSize,
    blockB.x,
    blockB.y,
    blockB.x + blockSize,
    blockB.y + blockSize,
  );
}

function testCollision(aMinX, aMinY, aMaxX, aMaxY, bMinX, bMinY, bMaxX, bMaxY) {
  const leftPenetration = aMaxX - bMinX;
  const rightPenetration = bMaxX - aMinX;
  const topPenetration = aMaxY - bMinY;
  const bottomPenetration = bMaxY - aMinY;
  if (leftPenetration < 0
    || rightPenetration < 0
    || topPenetration < 0
    || bottomPenetration < 0) {
    return null;
  }
  const minPenetration = Math.min(
    leftPenetration,
    rightPenetration,
    topPenetration,
    bottomPenetration,
  );
  if (leftPenetration === minPenetration) {
    return leftDxdy;
  }
  if (rightPenetration === minPenetration) {
    return rightDxdy;
  }
  if (topPenetration === minPenetration) {
    return topDxdy;
  }
  if (bottomPenetration === minPenetration) {
    return bottomDxdy;
  }
}

class CollisionGrid {
  constructor(width, height, cellSize) {
    this.cellSize = cellSize;
    this.width = Math.ceil(width / cellSize);
    this.height = Math.ceil(height / cellSize);
    this.array = Array(this.width * this.height).fill(0).map(_ => []);
  }

  clear() {
    for (const cell of this.array) {
      cell.length = 0;
    }
  }

  addRect(minX, minY, maxX, maxY, item) {
    if (!this.inRange(minX, minY) || !this.inRange(maxX, maxY)) {
      return;
    }

    const topLeftIndex = this.getCellIndex(minX, minY);
    const topRightIndex = this.getCellIndex(maxX, minY);
    const bottomLeftIndex = this.getCellIndex(minX, maxY);
    const bottomRightIndex = this.getCellIndex(maxX, maxY);

    this.array[topLeftIndex].push(item);
    if (topRightIndex !== topLeftIndex) {
      this.array[topRightIndex].push(item);
    }
    if (bottomLeftIndex !== topLeftIndex && bottomLeftIndex !== topRightIndex) {
      this.array[bottomLeftIndex].push(item);
    }
    if (bottomRightIndex !== topLeftIndex && bottomRightIndex !== topRightIndex && bottomRightIndex !== bottomLeftIndex) {
      this.array[bottomRightIndex].push(item);
    }
  }

  forEachCollision(minX, minY, maxX, maxY, f) {
    if (!this.inRange(minX, minY) || !this.inRange(maxX, maxY)) {
      return;
    }

    const topLeftIndex = this.getCellIndex(minX, minY);
    const topRightIndex = this.getCellIndex(maxX, minY);
    const bottomLeftIndex = this.getCellIndex(minX, maxY);
    const bottomRightIndex = this.getCellIndex(maxX, maxY);

    this.forEachCellItem(topLeftIndex, f);
    if (topRightIndex !== topLeftIndex) {
      this.forEachCellItem(topRightIndex, f);
    }
    if (bottomLeftIndex !== topLeftIndex && bottomLeftIndex !== topRightIndex) {
      this.forEachCellItem(bottomLeftIndex, f);
    }
    if (bottomRightIndex !== topLeftIndex && bottomRightIndex !== topRightIndex && bottomRightIndex !== bottomLeftIndex) {
      this.forEachCellItem(bottomRightIndex, f);
    }
  }

  getCellIndex(x, y) {
    return Math.floor(y / this.cellSize) * this.width + Math.floor(x / this.cellSize);
  }

  forEachCellItem(index, f) {
    for (const item of this.array[index]) {
      f(item);
    }
  }

  inRange(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  render() {
    context.beginPath();
    for (let x = 1; x <= this.width; ++x) {
      context.moveTo(x * this.cellSize, 0);
      context.lineTo(x * this.cellSize, height);
    }
    for (let y = 1; y <= this.height; ++y) {
      context.moveTo(0, y * this.cellSize);
      context.lineTo(width, y * this.cellSize);
    }
    context.strokeStyle = 'black';
    context.stroke();

    context.font = '20px sans-serif';
    context.fillStyle = 'black';
    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.height; ++y) {
        context.fillText(
          this.array[y * this.width + x].length,
          (x + 0.5) * this.cellSize,
          (y + 0.5) * this.cellSize,
        );
      }
    }
  }
}

main();
