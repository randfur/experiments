async function main() {
  document.body.style.cssText = `
    background-color: black;
    margin: 0;
    padding: 0;
  `;
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const context = canvas.getContext('2d');

  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  window.addEventListener('pointermove', event => {
    targetPointerX = (event.offsetX - canvas.width / 2) / 1000;
    targetPointerY = (event.offsetY - canvas.height / 2) / 1000;
  });

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    pointerX += (targetPointerX - pointerX) / 10;
    pointerY += (targetPointerY - pointerY) / 10;

    context.fillStyle = '#555';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#222';
    const trigScaleXx = 1414 + pointerX;
    const trigScaleXy = 2303 + 20 * Math.cos(time / 1e5);
    const trigScaleYx = 3202 + 30 * Math.cos(time / 5e5);
    const trigScaleYy = 4141 + pointerY;
    const displacement =  9 + 2 * Math.cos(time / 1e6);
    const step = 23;
    const start = - step;

    function displacementX(x, y) {
      return x + displacement * Math.cos(
        (x - canvas.width / 2) * trigScaleXx
        + (y - canvas.height / 2) * trigScaleXy
      );
    }

    function displacementY(x, y) {
      return y + displacement * Math.cos(
        (x - canvas.width / 2) * trigScaleYx
        + (y - canvas.height / 2) * trigScaleYy
      );
    }

    context.beginPath();
    for (let y = start; y < canvas.height + step; y += step) {
      context.moveTo(displacementX(start, y), displacementY(start, y));
      for (let x = start; x < canvas.width + step; x += step) {
        context.lineTo(displacementX(x, y), displacementY(x, y));
      }
    }
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    for (let x = start; x < canvas.width + step; x += step) {
      context.moveTo(displacementX(x, start), displacementY(x, start));
      for (let y = start; y < canvas.height + step; y += step) {
        context.lineTo(displacementX(x, y), displacementY(x, y));
      }
    }
    context.lineWidth = 2;
    context.stroke();
  }
}

main();