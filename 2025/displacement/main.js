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

    function displacementX(x, y) {
      return displacement * Math.cos(
        (x - canvas.width / 2) * trigScaleXx
        + (y - canvas.height / 2) * trigScaleXy
      );
    }

    function displacementY(x, y) {
      return displacement * Math.cos(
        (x - canvas.width / 2) * trigScaleYx
        + (y - canvas.height / 2) * trigScaleYy
      );
    }

    context.beginPath();
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        context.moveTo(
          x + displacementX(x, y),
          y + displacementY(x, y),
        );
        context.lineTo(
          x + step + displacementX(x + step, y),
          y + displacementY(x + step, y),
        );
      }
    }
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        context.moveTo(
          x + displacementX(x, y),
          y + displacementY(x, y),
        );
        context.lineTo(
          x + displacementX(x, y + step),
          y + step + displacementY(x, y + step),
        );
      }
    }
    context.lineWidth = 2;
    context.stroke();
  }
}

main();