const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.getElementById('canvas');
let context = null;
const lineWidth = 1;

const output = document.getElementById('output');
const highScoreBoard = document.getElementById('high-score-board');
const scoreBoard = document.getElementById('score-board');
const gameDuration = 60 * 1000;
const highScoreBoardClearTime = 10 * 1000;
let highScoreBoardClearTimer = null;

const squareCount = (width * height / 5000) | 0;
const minSquareSize = 6;
const maxSquareSize = (Math.min(width, height) / 20) | 0;
const maxSquareSpeed = 40;
const nullColour = '#333';
const gameNullOutlineColour = 'white';
const topColour = '#04f';
const bottomColour = '#d00';
let squares = null;

const areaBarHeight = 3;
let totalArea = null;
let playerArea = null;
let bottomArea = null;
let topArea = null;
let nullArea = null;

let gridSize = maxSquareSize * 1;
let grid = null;

let game = false;
let endGameTimeout = null;
let startTime = null;
let score = null;
let maxPlayerAreaPercent = null;
let highScore = null;
let bestMaxPlayerAreaPercent = null;
const safeRadius = 3;
let playerSquare = null;
const playerColour = '#fc0';
const playerKeySpeed = 200;

let keyDown = null;

let debug = false;

function log(text) {
  if (text !== '') {
    output.textContent += text + '\n';
  }
}
function clearLog() {
  output.textContent = '';
}

function range(n) {
  let result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return 2 * Math.random() * x - x;
}

function init() {
  window.addEventListener('error', event => {
    log(event.error.stack);
  });
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  context.lineWidth = lineWidth;
  
  squares = range(squareCount).map(_ => ({
    x: random(width),
    y: random(height),
    size: Math.max(minSquareSize, random(maxSquareSize)),
    dx: deviate(maxSquareSpeed),
    dy: deviate(maxSquareSpeed),
    colour: null,
    collisionList: null,
  }));

  playerSquare = {
    x: width / 2,
    y: height / 2,
    size: maxSquareSize,
    colour: null,
    collisionList: null,
  };

  window.addEventListener('mousemove', event => {
    playerSquare.x = event.clientX;
    playerSquare.y = event.clientY;
  });
  window.addEventListener('mousedown', event => {
    toggleGame();
  });
  
  keyDown = {};
  window.addEventListener('keydown', event => {
    if (event.code == 'Space') {
      toggleGame();
    }
    if (event.key == 'd') {
      debug ^= true;
    }
    keyDown[event.code] = true;
  });
  window.addEventListener('keyup', event => {
    keyDown[event.code] = false;
  });
  
  grid = range(width / gridSize).map(_ => range(height / gridSize).map(_ => []));
  
  totalArea = 0;
  for (const square of [...squares, playerSquare]) {
    totalArea += square.size ** 2;
  }
}

function toggleGame() {
  game ? endGame() : startGame();
}

function startGame() {
  game = true;
  for (const square of squares) {
    if (!square.colour || square.colour == playerColour) {
      square.colour = (square.y < height / 2) ? topColour : bottomColour;
    }
    const playerDistanceSquared = (square.x - playerSquare.x) ** 2 + (square.y - playerSquare.y) ** 2;
    if (playerDistanceSquared < (playerSquare.size * safeRadius) ** 2) {
      square.colour = null;
    }
  }
  playerSquare.colour = playerColour;
  startTime = Date.now();
  score = 0;
  maxPlayerAreaPercent = 0;
  highScoreBoard.textContent = '';
  endGameTimeout = setTimeout(endGame, gameDuration);
}

function endGame() {
  game = false;
  clearTimeout(endGameTimeout);
  const seconds = (Date.now() - startTime) / 1000;
  highScore = Math.max(score, highScore || 0);
  bestMaxPlayerAreaPercent = Math.max(maxPlayerAreaPercent, bestMaxPlayerAreaPercent || 0);
  scoreBoard.textContent = '';
  highScoreBoard.textContent = [
    `Time: ${secondsToString(seconds)}`,
    '',
    `Score: ${Math.round(score)}`,
    `Max area: ${maxPlayerAreaPercent.toFixed(1)}%`,
    '',
    `Highscore: ${Math.round(highScore)}`,
    `Best max area: ${bestMaxPlayerAreaPercent.toFixed(1)}%`,
  ].join('\n');
  if (highScoreBoardClearTimer) {
    clearTimeout(highScoreBoardClearTimer);
  }
  highScoreBoardClearTimer = setTimeout(_ => {
    highScoreBoard.textContent = '';
  }, highScoreBoardClearTime);
}

function secondsToString(seconds) {
  return `${(seconds / 60) | 0}:${String(Math.round(seconds % 60)).padStart(2, 0)}`;
}

function getCell(x, y) {
  return grid[
    Math.max(0, Math.min(width - 1, x) / gridSize) | 0
  ][
    Math.max(0, Math.min(height - 1, y) / gridSize) | 0
  ];
}

const dirs = [-1, 1];
function addSquareToGrid(square) {
  for (const xDir of dirs) {
    for (const yDir of dirs) {
      getCell(square.x + square.size / 2 * xDir, square.y + square.size / 2 * yDir).push(square);
    }
  }
}

function drawSquare(square) {
  if (game && !square.colour) {
    context.strokeStyle = gameNullOutlineColour;
    context.strokeRect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);
    return;
  }
  context.fillStyle = square.colour || nullColour;
  context.fillRect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);
}

function updateAreas(square) {
  const squareArea = square.size ** 2;
  switch (square.colour) {
    case playerColour:
      playerArea += squareArea;
      break;
    case bottomColour:
      bottomArea += squareArea;
      break;
    case topColour:
      topArea += squareArea;
      break;
    case null:
      nullArea += squareArea;
      break;
  }
}

const listPool = [];
let nextList = 0;
function getList() {
  if (nextList == listPool.length) {
    listPool.push([]);
  }
  return listPool[nextList++];
}

function releaseLists() {
  for (let i = 0; i < nextList; ++i) {
    listPool[i].length = 0;
  }
  nextList = 0;
}

const counts = range(3).map(_ => ({count: 0, colour: null}));
function countSort(countA, countB) {
  return countA.count - countB.count;
}

const collisionLists = [];
function update(time, timeDelta) {
  timeDelta = Math.min(timeDelta, 1);
  
  for (const row of grid) {
    for (const cell of row) {
      cell.length = 0;
    }
  }

  playerArea = 0;
  bottomArea = 0;
  topArea = 0;
  nullArea = 0;

  for (let square of squares) {
    square.x += square.dx * timeDelta;
    square.y += square.dy * timeDelta;
    const halfSize = square.size / 2;
    if (square.x - halfSize < 0) { square.x = halfSize; square.dx *= -1; if (!game) { square.colour = null; } }
    if (square.x + halfSize > width) { square.x = width - halfSize; square.dx *= -1; if (!game) { square.colour = null; } }
    if (square.y - halfSize < 0) { square.y = halfSize; square.dy *= -1; if (!game) { square.colour = topColour; } }
    if (square.y + halfSize > height) { square.y = height - halfSize; square.dy *= -1; if (!game) { square.colour = bottomColour; } }
    addSquareToGrid(square);
    updateAreas(square);
  }
  if (game) {
    if (keyDown['ArrowUp']) { playerSquare.y -= timeDelta * playerKeySpeed; }
    if (keyDown['ArrowDown']) { playerSquare.y += timeDelta * playerKeySpeed; }
    if (keyDown['ArrowLeft']) { playerSquare.x -= timeDelta * playerKeySpeed; }
    if (keyDown['ArrowRight']) { playerSquare.x += timeDelta * playerKeySpeed; }
    addSquareToGrid(playerSquare);
    updateAreas(playerSquare);
  }

  let collisionChecks = 0;
  let collisionCount = 0;
  for (const row of grid) {
    for (const cell of row) {
      for (let i = 0; i < cell.length; ++i) {
        const squareA = cell[i];
        for (let j = i + 1; j < cell.length; ++j) {
          collisionChecks++;
          const squareB = cell[j];
          if (squareA == squareB) {
            continue;
          }
          if (squareA.collisionList && squareA.collisionList == squareB.collisionList) {
            continue;
          }
          const xDist = Math.abs(squareB.x - squareA.x);
          const yDist = Math.abs(squareB.y - squareA.y);
          const collisionDist = (squareA.size + squareB.size) / 2;
          if (xDist <= collisionDist && yDist <= collisionDist) {
            collisionCount++;
            if (!squareA.collisionList && !squareB.collisionList) {
              const collisionList = getList();
              collisionList.push(squareA, squareB);
              squareA.collisionList = collisionList;
              squareB.collisionList = collisionList;
            } else if (!squareA.collisionList) {
              squareB.collisionList.push(squareA);
              squareA.collisionList = squareB.collisionList;
            } else if (!squareB.collisionList) {
              squareA.collisionList.push(squareB);
              squareB.collisionList = squareA.collisionList;
            } else if (squareA.collisionList != squareB.collisionList) {
              const aIsSmaller = squareA.collisionList.size < squareB.collisionList.size;
              const biggerList = aIsSmaller ? squareA.collisionList : squareB.collisionList;
              const smallerList = aIsSmaller ? squareB.collisionList : squareA.collisionList;
              for (const square of smallerList) {
                biggerList.push(square);
                square.collisionList = biggerList;
              }
              if (aIsSmaller) {
                squareA.collisionList = biggerList;
              } else {
                squareB.collisionList = biggerList;
              }
            }
          }
        }
      }
    }
  }
  
  if (game) {
    const playerAreaPercent = playerArea / totalArea * 100;
    score += playerAreaPercent * timeDelta;
    maxPlayerAreaPercent = Math.max(playerAreaPercent, maxPlayerAreaPercent);
    scoreBoard.textContent = `Time: ${secondsToString((gameDuration - (Date.now() - startTime)) / 1000)}\nScore: ${score.toFixed(1)}\nArea: ${playerAreaPercent.toFixed(1)}%`;
  }
  
  collisionLists.length = 0;
  for (const {collisionList} of squares) {
    if (!collisionList) {
      continue;
    }
    collisionLists.push(collisionList);
    counts[0].colour = playerColour;
    counts[0].count = 0;
    counts[1].colour = topColour;
    counts[1].count = 0;
    counts[2].colour = bottomColour;
    counts[2].count = 0;
    for (const square of collisionList) {
      square.collisionList = null;
      switch (square.colour) {
        case playerColour: counts[0].count++; break;
        case topColour: counts[1].count++; break;
        case bottomColour: counts[2].count++; break;
        case null: break;
      }
    }
    counts.sort(countSort);
    if (counts[0].count == counts[1].count) {
      counts[0].count = 0;
      counts[1].count = 0;
    } else if (counts[1].count == counts[2].count) {
      counts[1].count = 0;
      counts[2].count = 0;
    }
    let finalColour = null;
    for (let i = 3; 0 <=-- i;) {
      if (counts[i].count > 0) {
        finalColour = counts[i].colour;
        break;
      }
    }
    for (const square of collisionList) {
      square.colour = finalColour;
    }
  }

  clearLog();
  if (debug) {
    log(`squareCount: ${squareCount}`);
    log(`maxSquareSize: ${maxSquareSize}`);
    log(`gridSize: ${gridSize}`);
    log(`grid cell count: ${grid.length * grid[0].length}`);
    log(`collisionChecks: ${collisionChecks}`);
    log(`collisionCount: ${collisionCount}`);
    log(`collisionLists.length: ${collisionLists.length}`);
    log(`Largest collision list: ${Math.max(...collisionLists.map(l => l.length))}`);
  }
  
  context.clearRect(0, 0, width, height);
  if (debug) {
    context.strokeStyle = 'grey';
    context.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();
  }
  
  for (let square of squares) {
    drawSquare(square);
  }
  if (game) {
    drawSquare(playerSquare);

    context.fillStyle = playerColour;
    let areaX = 0;
    let areaBarWidth = playerArea / totalArea * width;
    context.fillRect(areaX, height - areaBarHeight, areaBarWidth, areaBarHeight);
    context.fillStyle = bottomColour;
    areaX += areaBarWidth;
    areaBarWidth = bottomArea / totalArea * width;
    context.fillRect(areaX, height - areaBarHeight, areaBarWidth, areaBarHeight);
    context.fillStyle = topColour;
    areaX += areaBarWidth;
    areaBarWidth = topArea / totalArea * width;
    context.fillRect(areaX, height - areaBarHeight, areaBarWidth, areaBarHeight);
    context.fillStyle = nullColour;
    areaX += areaBarWidth;
    areaBarWidth = nullArea / totalArea * width;
    context.fillRect(areaX, height - areaBarHeight, areaBarWidth, areaBarHeight);
  }
  if (debug) {
    for (const collisionList of collisionLists) {
      const colour = collisionList[0].colour;
      if (!colour) {
        continue;
      }
      context.fillStyle = 'white';
      let x = 0;
      let y = 0;
      for (const square of collisionList) {
        x += square.x;
        y += square.y;
      }
      x /= collisionList.length;
      y /= collisionList.length;
      context.fillText(collisionList.length, x, y);

      context.strokeStyle = 'white';
      context.beginPath();
      for (let i = 0; i < collisionList.length; ++i) {
        const squareA = collisionList[i];
        for (let j = i + 1; j < collisionList.length; ++j) {
          const squareB = collisionList[j];
          context.moveTo(squareA.x, squareA.y);
          context.lineTo(squareB.x, squareB.y);
        }
      }
      context.stroke();
    }
  }
  
  releaseLists();
}

function everyFrame(f) {
  let lastTime = 0;
  function frame(time) {
    f(time / 1000, (time - lastTime) / 1000);
    lastTime = time;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function main() {
  init();
  everyFrame(update);
}
main();