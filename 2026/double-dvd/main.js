const blockSize = 32;
const blockSpeed = 2;
const blockTrailLength = 20;
const maxColourBlockCount = 1000;
const width = window.innerWidth;
const height = window.innerHeight;
const wallSize = 64;
const floorColour = '#436';
const wallColour = '#84a';

let colourBlocks = null;
let walls = null;
let context = null;

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
}

function init() {
  colourBlocks = {
    'red': createBlockPair(
      wallSize, width / 2 - blockSize,
      wallSize, height / 2 - blockSize,
    ),
    'khaki': createBlockPair(
      width / 2, width - wallSize,
      wallSize, height / 2 - blockSize,
    ),
    'green': createBlockPair(
      width / 2, width - wallSize,
      height / 2, height - wallSize,
    ),
    'blue': createBlockPair(
      wallSize, width / 2 - blockSize,
      height / 2, height - wallSize,
    ),
  };
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
  ];
}

function update() {
  const removeBlocks = new Set();
  const addColourBlocks = {};

  for (const colour in colourBlocks) {
    const blocks = colourBlocks[colour];
    for (let i = 0; i < blocks.length; ++i) {
      const block = blocks[i];

      --block.cooldownLeft;

      block.trail.push({x: block.x, y: block.y})
      while (block.trail.length > blockTrailLength) {
        block.trail.shift();
      }

      block.x += block.dx;
      block.y += block.dy;

      for (const wall of walls) {
        updateDxdy(block, testWallCollision(block, wall));
      }

      for (const otherColour in colourBlocks) {
        if (colour > otherColour) {
          continue;
        }
        const otherBlocks = colourBlocks[otherColour];
        for (let j = 0; j < otherBlocks.length; ++j) {
          if (colour === otherColour && i >= j) {
            continue;
          }
          const otherBlock = otherBlocks[j];
          const collisionDxdy = testBlockCollision(block, otherBlock);
          if (collisionDxdy) {
            if (colour === otherColour && block.cooldownLeft <= 0 && otherBlock.cooldownLeft <= 0) {
              removeBlocks.add(block);
              removeBlocks.add(otherBlock);
              const midX = Math.round((block.x + otherBlock.x) / 2);
              const midY = Math.round((block.y + otherBlock.y) / 2);
              if (!(colour in addColourBlocks)) {
                addColourBlocks[colour] = [];
              }
              addColourBlocks[colour].push(
                createBlock(midX, midY, -blockSpeed, -blockSpeed),
                createBlock(midX + blockSize + 1, midY, blockSpeed, -blockSpeed),
                createBlock(midX, midY + blockSize + 1, -blockSpeed, blockSpeed),
                createBlock(midX + blockSize + 1, midY + blockSize + 1, blockSpeed, blockSpeed),
              );
            } else {
              const colourCount = colourBlocks[colour].length;
              const otherColourCount = colourBlocks[otherColour].length;
              if (colourCount > otherColourCount) {
                removeBlocks.add(otherBlock);
              } else if (colourCount < otherColourCount) {
                removeBlocks.add(block);
              } else {
                updateDxdy(block, collisionDxdy);
                updateDxdy(otherBlock, oppositeDxdy(collisionDxdy));
              }
            }
          }
        }
      }
    }
  }

  for (const colour in colourBlocks) {
    colourBlocks[colour] = colourBlocks[colour].filter(block => !removeBlocks.has(block));
  }
  for (const colour in addColourBlocks) {
    for (const block of addColourBlocks[colour]) {
      colourBlocks[colour].push(block);
    }
  }

  for (const blocks of Object.values(colourBlocks)) {
    if (blocks.length >= maxColourBlockCount) {
      init();
      return;
    }
  }
}

function render() {
  context.fillStyle = floorColour;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'black';

  // Trails
  for (const colour in colourBlocks) {
    const blocks = colourBlocks[colour];
    context.fillStyle = 'dark' + colour;
    for (const block of blocks) {
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
  }

  // Blocks
  for (const colour in colourBlocks) {
    const blocks = colourBlocks[colour];
    context.fillStyle = colour;
    for (const block of blocks) {
      context.fillRect(block.x, block.y, blockSize, blockSize);
      context.strokeRect(block.x, block.y, blockSize, blockSize);
    }
  }

  // Walls
  context.fillStyle = wallColour;
  for (const wall of walls) {
    context.fillRect(wall.x, wall.y, wall.width, wall.height);
    context.strokeRect(wall.x, wall.y, wall.width, wall.height);
  }
}

function createBlock(x, y, dx, dy) {
  return {
    x,
    y,
    dx,
    dy,
    trail: [],
    cooldownLeft: 60,
  };
}

function createBlockRandomDirection(x, y) {
  return createBlock(
    x,
    y,
    blockSpeed * (Math.random() > 0.5 ? 1 : -1),
    blockSpeed * (Math.random() > 0.5 ? 1 : -1),
  );
}

function createBlockPair(xMin, xMax, yMin, yMax) {
  const first = createBlockRandomDirection(
    randomRange(xMin, xMax),
    randomRange(yMin, yMax),
  );
  let second = null;
  let attempts = 0;
  while (true) {
    second = createBlockRandomDirection(
      randomRange(xMin, xMax),
      randomRange(yMin, yMax),
    );
    if (testBlockCollision(first, second) === null) {
      break;
    }
    ++attempts;
    if (attempts > 100) {
      break;
    }
  }
  return [first, second];
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

main();
