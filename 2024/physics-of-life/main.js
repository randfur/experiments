import {HexLines2d} from './third-party/hex-lines/src/2d/hex-lines-2d.js';
import {GroupDrawing} from './third-party/hex-lines/src/2d/group-drawing.js';
import {Particle} from './particle.js';
import {sleep, repeat, makeGrid} from './utils.js';

async function main() {
  const {
    hexLines2d,
    width,
    height,
  } = HexLines2d.setupFullPageCanvas();

  const particles = [];
  repeat(10, () => {
    particles.push(new Particle(hexLines2d));
  });

  const drawing = new GroupDrawing({
    pixelSize: 4,
    children: [],
  });

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  while (true) {
    await sleep(30);

    for (const particle of particles) {
      particle.step();
    }

    // Get all grid positions of particles.
    const gridWidth = Math.floor(width / Particle.size);
    const gridHeight = Math.floor(height / Particle.size);

    const grid = makeGrid({
      cellSize: Particle.size,
      width: gridWidth,
      height: gridHeight,
    });
    function setGridCell(x, y, value) {
      const col = Math.floor(x / Particle.size);
      const row = Math.floor(y / Particle.size);
      if (col > 0 && col < gridWidth && row >= 0 && row < gridHeight) {
        grid[row][col] = value;
      }
    }
    for (const particle of particles) {
      setGridCell(particle.position.x + (width / 2), -particle.position.y + (height / 2), '<>');
    }
    setGridCell(mouseX, mouseY, '🐁');
    console.log(grid.map(row => row.map(cell => cell ? cell : '  ').join('')).join('\n'));

    // Create/destroy particles based on grid rules.
    // If there are two cells seen by an empty cell then spawn a particle.
    // Initial direction:
    // - Random.
    // - Random of the two cells.
    // - Average of the two cells.
    // - Away from the two cells.
    // - Average away from and of the two cells.
    // If a particle has more than three neighbour cells then kill it.


    // Draw them all.
    drawing.children = [];
    for (const particle of particles) {
      drawing.children.push(particle.draw());
    }
    // hexLines2d.draw(drawing);
  }
}

main();