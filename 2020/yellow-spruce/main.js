const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;

function log(text) {
  if (text !== '') {
    output.textContent += text + '\n';
  }
}
window.addEventListener('error', event => {
  log(event.error.stack);
});

let canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
let context = canvas.getContext('2d');

class Mat {
  static identityArray = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);

  static temps = [];
  static nextTemp = 0;
  static getTemp() {
    while (Mat.nextTemp >= Mat.temps.length) {
      Mat.temps.push(new Mat());
    }
    return Mat.temps[Mat.nextTemp++];
  }
  static releaseTemp(n) {
    Mat.nextTemp -= n;
  }

  constructor() {
    this.array = new Float32Array(Mat.identityArray);
  }
}

class Vec {
  static temps = [];
  static nextTemp = 0;
  static getTemp() {
    while (Vec.nextTemp >= Vec.temps.length) {
      Vec.temps.push(new Vec(0, 0, 0));
    }
    return Vec.temps[Vec.nextTemp++];
  }
  static releaseTemp(n) {
    Vec.nextTemp -= n;
  }

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
}

function toScreenCoords(vertex, screenVertex) {
  screenVertex.x = width / 2 + vertex.x * perspective / (vertex.z + cameraPullBack);
  screenVertex.y = height / 2 - vertex.y * perspective / (vertex.z + cameraPullBack);
}

function moveTo(vertex) {
  const temp = Vec.getTemp();
  toScreenCoords(vertex, temp);
  context.moveTo(temp.x, temp.y);
  Vec.releaseTemp(1);
}

function lineTo(vertex) {
  const temp = Vec.getTemp();
  toScreenCoords(vertex, temp);
  context.lineTo(temp.x, temp.y);
  Vec.releaseTemp(1);
}

// Init

const cameraPullBack = 500;
const perspective = 400;
const boxSize = 200;
const anchorSize = 10;
const handleSize = 10;
const hitSizeFactor = 2;

const hotSpots = [
  [
    new Vec(-boxSize / 2, -boxSize / 2, 0),
    new Vec(-boxSize / 2, 0, 0),
    new Vec(-boxSize / 2, boxSize / 2, 0),
  ], [
    new Vec(0, -boxSize / 2, 0),
    new Vec(0, 0, 0),
    new Vec(0, boxSize / 2, 0),
  ], [
    new Vec(boxSize / 2, -boxSize / 2, 0),
    new Vec(boxSize / 2, 0, 0),
    new Vec(boxSize / 2, boxSize / 2, 0),
  ],
];

const vertices = [
  hotSpots[0][0],
  hotSpots[0][2],
  hotSpots[2][2],
  hotSpots[2][0],
];

let mouseX = 0;
let mouseY = 0;
let mouseClick = false;
let mouseClickX = 0;
let mouseClickY = 0;

let anchor = new Vec(-40, -40, 0);
let anchorHover = false;
let anchorClick = new Vec(0, 0, 0);

let translate = new Vec(0, 0, 0);
let translateClick = new Vec(0, 0, 0);

let handles = {
  vertical: null,
  horizontal: null,
  diagonal: null,
};
let handleHover = null;

function updateHandles() {
  handles.vertical = hotSpots[1][anchor.y > 0 ? 0 : 2];
  handles.horizontal = hotSpots[anchor.x > 0 ? 0 : 2][1];
  handles.diagonal = hotSpots[anchor.x > 0 ? 0 : 2][anchor.y > 0 ? 0 : 2];
}
updateHandles();

function mouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  if (!mouseClick) {
    { // Handles
      const temp = Vec.getTemp()
      let oldHandleHover = handleHover;
      handleHover = null;
      let minDist = Infinity;
      for (let handle of Object.values(handles)) {
        temp.copy(handle);
        temp.add(translate);
        toScreenCoords(temp, temp);
        const dist = Math.max(Math.abs(mouseX - temp.x), Math.abs(mouseY - temp.y));
        if (dist < minDist && dist <= handleSize / 2 * hitSizeFactor) {
          minDist = dist;
          handleHover = handle;
        }
      }
      if (oldHandleHover !== handleHover) {
        redraw();
      }
      Vec.releaseTemp(1);
    }

    { // Anchor
      const oldAnchorHover = anchorHover;
      anchorHover = false;
      if (!handleHover) {
        const temp = Vec.getTemp()
        temp.copy(anchor);
        temp.add(translate);
        toScreenCoords(temp, temp);
        const dist = Math.abs(mouseX - temp.x) + Math.abs(mouseY - temp.y);
        anchorHover = dist <= anchorSize * Math.SQRT1_2 * hitSizeFactor;
        Vec.releaseTemp(1);
      }
      if (oldAnchorHover != anchorHover) {
        redraw();
      }
    }
  } else {
    if (handleHover) {
      translate.copy(translateClick);
      switch (handleHover) {
        case handles.vertical:
          translate.y -= mouseY - mouseClickY;
          break;
        case handles.horizontal:
          translate.x += mouseX - mouseClickX;
          break;
        case handles.diagonal:
          translate.z -= mouseY - mouseClickY;
          break;
      }
      redraw();
    } else if (anchorHover) {
      anchor.x = anchorClick.x + mouseX - mouseClickX;
      anchor.y = anchorClick.y - (mouseY - mouseClickY);
      updateHandles();
      redraw();
    }
  }
}
window.addEventListener('mousemove', mouseMove);

function mouseDown(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouseClick = true;
  mouseClickX = mouseX;
  mouseClickY = mouseY;
  
  if (handleHover) {
    translateClick.copy(translate);
  } else if (anchorHover) {
    anchorClick.copy(anchor);
  }
}
window.addEventListener('mousedown', mouseDown);

function mouseUp(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouseClick = false;
}
window.addEventListener('mouseup', mouseUp);

function draw() {
  context.clearRect(0, 0, width, height);

  { // Box
    context.fillStyle = 'black';
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.beginPath();
    let temp = Vec.getTemp();
    for (let i = 0; i <= vertices.length; ++i) {
      let vertex = vertices[i % vertices.length];
      temp.copy(vertex);
      temp.add(translate);
      if (i == 0) {
        moveTo(temp);
      } else {
        lineTo(temp);
      }
    }
    Vec.releaseTemp(1);
    context.stroke();
  }

  { // Anchor
    const temp = Vec.getTemp();
    temp.copy(anchor);
    temp.add(translate);
    toScreenCoords(temp, temp);
    context.save();
    context.translate(temp.x, temp.y);
    context.rotate(TAU / 8);
    context.fillStyle = anchorHover ? '#0af' : 'black';
    context.fillRect(-anchorSize / 2, -anchorSize / 2, anchorSize, anchorSize);
    context.strokeRect(-anchorSize / 2, -anchorSize / 2, anchorSize, anchorSize);
    context.restore();
    Vec.releaseTemp(1);
  }

  { // Handles
    const temp = Vec.getTemp();
    for (const handle of Object.values(handles)) {
      temp.copy(handle);
      temp.add(translate);
      toScreenCoords(temp, temp);
      context.fillStyle = handle === handleHover ? '#fa0' : 'black';
      context.fillRect(temp.x - handleSize / 2, temp.y - handleSize / 2, handleSize, handleSize);
      context.strokeRect(temp.x - handleSize / 2, temp.y - handleSize / 2, handleSize, handleSize);
    }
    Vec.releaseTemp(1);
  }
}

let drawRequested = false;
function frame() {
  drawRequested = false;
  draw();
}
function redraw() {
  if (drawRequested) {
    return;
  }
  drawRequested = true;
  requestAnimationFrame(frame);
}
redraw();