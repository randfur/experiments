async function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  const grid = [
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
    [1,2,3,4,5,6,7,8,9],
  ];

  const dragging = {
    x: 0,
    y: 0,
    dx: 50,
    dy: 0,
  };

  function render() {
    const size = 300;
    for (let i = 0; i < 9; ++i) {
      let x = i % 3 * size;
      let y = Math.floor(i / 3) * size;
      if (dragging.dx !== 0 && dragging.y === y) {
        x += dragging.dx;
      } else if (dragging.dy !== 0 && dragging.x == x) {
        y += dragging.dy;
      }
      context.strokeRect(x, y, size, size);
    }
  }
  render();
}

main();