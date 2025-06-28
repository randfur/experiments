window.TAU = 2 * Math.PI;

window.width = null;
window.height = null;
window.context = null;

window.objects = [];
window.camera = null;
const cameraPerspective = 600;

window.mouse = {
  pressed: false,
  x: null,
  y: null,
  dx: 0,
  dy: 0,
};
window.addEventListener('mousedown', () => mouse.pressed = true);
window.addEventListener('mouseup', () => mouse.pressed = false);
window.addEventListener('mousemove', (offsetX, offsetY) => {
  if (mouse.x !== null) {
    mouse.dx = offsetX - mouse.x;
    mouse.dy = offsetY - mouse.y;
  }
  mouse.x = offsetX;
  mouse.y = offsetY;
});

function main() {
  init();
  requestAnimationFrame(frame);
}

function init() {
  width = innerWidth;
  height = innerHeight;
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
}

function checkedCall(object, functionName, ...args) {
  if (object[functionName])
    object[functionName](...args);
}

for (const eventName of ['mousedown', 'mousemove', 'mouseup']) {
  window.addEventListener(eventName, event => {
    checkedCall(camera, eventName, event);
    for (let object of objects)
      checkedCall(object, eventName, event);
  });
}

function frame(milliseconds) {
  const seconds = milliseconds / 1000;

  checkedCall(camera, 'update', seconds);
  for (let object of objects)
    checkedCall(object, 'update', seconds);

  render();
  requestAnimationFrame(frame);
}

function render() {
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);  
  for (let object of objects) {
    let {x, y, z} = object.pos;
    if (y <= camera.pos.y) {
      continue;
    }
    y = (y - camera.pos.y) / cameraPerspective;
    x = (x - camera.pos.x) / y;
    z = (z - camera.pos.z) / y;
    const scale = 1 / y;
    context.save();
    context.scale(scale, scale);
    context.translate(x / scale, -z / scale);
    object.render();
    context.restore();
  }
  context.restore();
}

window.onload = main;

