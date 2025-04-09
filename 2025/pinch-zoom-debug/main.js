function main() {
  document.body.style.cssText = `
    margin: 0;
    touch-action: none;
    overflow: hidden;
  `;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  const context = canvas.getContext('2d');

  function renderTouches(event) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'blue';
    for (let i = 0; i < event.touches.length; ++i) {
      const touch = event.touches[i];
      context.fillRect(touch.screenX - 5, touch.screenY - 5, 10, 10);
    }
  }

  window.addEventListener('touchstart', renderTouches);
  window.addEventListener('touchmove', renderTouches);
  window.addEventListener('touchend', renderTouches);
}

main();