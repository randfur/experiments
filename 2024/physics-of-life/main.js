import {HexLines2d} from '../third-party/hex-lines/src/2d/hex-lines-2d.js';
import {GroupDrawing} from '../third-party/hex-lines/src/2d/group-drawing.js';
import {Particle} from './particle.js';
import {sleep, repeat, deviate, makeGrid} from './utils.js';

async function main() {
  const {
    hexLines2d,
    width,
    height,
  } = HexLines2d.setupFullPageCanvas();

  let particles = [];
  repeat(10, () => {
    particles.push(new Particle({
      hexLines2d,
      position: {
        x: deviate(200),
        y: deviate(200),
      },
      velocity: {
        x: deviate(4),
        y: deviate(4),
      },
    }));
  });

  const drawing = new GroupDrawing({
    pixelSize: 4,
    children: [],
  });

  while (true) {
    await new Promise(requestAnimationFrame);

    for (const particle of particles) {
      particle.step();
    }

    // Get all grid positions of particles.
    const gridCols = Math.floor(width / Particle.size);
    const gridRows = Math.floor(height / Particle.size);

    const grid = makeGrid({
      cellSize: Particle.size,
      rows: gridRows,
      cols: gridCols,
      value: null,
    });
    function ifInBounds({x, y, divisor, f, felse}) {
      const col = Math.floor(x / divisor);
      const row = Math.floor(y / divisor);
      if (col > 0 && col < gridCols && row >= 0 && row < gridRows) {
        f(row, col);
      } else {
        felse?.();
      }
    }
    for (const particle of particles) {
      ifInBounds({
        x: particle.position.x + (width / 2),
        y: -particle.position.y + (height / 2),
        divisor: Particle.size,
        f: (row, col) => {
          if (!grid[row][col]) {
            grid[row][col] = [];
          }
          grid[row][col].push(particle);
        },
        felse: () => particle.alive = false,
      });
    }

    // Create/destroy particles based on grid rules.
    // If there are two cells seen by an empty cell then spawn a particle.
    // Initial direction:
    // - Random.
    // - Random of the two cells.
    // - Average of the two cells.
    // - Away from the two cells.
    // - Average away from and of the two cells.
    // If a particle has more than three neighbour cells then kill it.
    const countGrid = makeGrid({
      cellSize: Particle.size,
      rows: gridRows,
      cols: gridCols,
      value: 0,
    });
    const neighbours = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    for (let row = 0; row < gridRows; ++row) {
      for (let col = 0; col < gridCols; ++col) {
        if (grid[row][col]) {
          const count = grid[row][col].length;
          for (const neighbour of neighbours) {
            ifInBounds({
              x: col + neighbour[0],
              y: row + neighbour[1],
              divisor: 1,
              f: (row, col) => {
                countGrid[row][col] += count;
              },
            });
          }
        }
      }
    }
    // console.log(countGrid.map(row => row.join('')).join('\n'));

    for (let row = 0; row < gridRows; ++row) {
      for (let col = 0; col < gridCols; ++col) {
        if (countGrid[row][col] === 3) {
          particles.push(new Particle({
            hexLines2d,
            position: {
              x: ((col + 0.5) * Particle.size) - (width / 2),
              y: -(((row + 0.5) * Particle.size) - (height / 2)),
            },
            velocity: {
              x: deviate(0.1),
              y: deviate(0.1),
            },
          }));
        }
        if (countGrid[row][col] > 3) {
          grid[row][col]?.forEach?.(particle => particle.alive = false);
        }
      }
    }

    particles = particles.filter(particle => particle.alive);

    // Draw them all.
    drawing.children = [];
    for (const particle of particles) {
      drawing.children.push(particle.draw());
    }
    hexLines2d.draw(drawing);
  }
}

main();