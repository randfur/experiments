const width = innerWidth;
const height = innerHeight;

const pageCanvas = document.getElementById('canvas');
pageCanvas.width = width;
pageCanvas.height = height;
const pageContext = pageCanvas.getContext('2d');

const sketchCanvas = new OffscreenCanvas(width, height);
const sketchContext = sketchCanvas.getContext('2d');
const sketchObject = {
  x: 0,
  y: 0,
  canvas: sketchCanvas,
  context: sketchContext,
};

const objects = [];

let lastMouseX = 0;
let lastMouseY = 0;
let mouseX = 0;
let mouseY = 0;
let mouseDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function createMarkerClass(name, size, compositeOperation) {
  return {
    [name]: class {
      constructor() {
        this.targetObject = objectUnderMouse();
      }
      handleDown() {
        if (this.targetObject) {
          const context = this.targetObject.context;
          context.strokeStyle = 'black';
          context.lineWidth = size;
          context.globalCompositeOperation = compositeOperation;
        }
      }
      handleMove() {
        if (mouseDragging) {
          if (this.targetObject) {
            const {x, y, context} = this.targetObject;
            context.beginPath();
            context.moveTo(lastMouseX - x, lastMouseY - y);
            context.lineTo(mouseX - x, mouseY - y);
            context.stroke();
          }
        } else {
          this.targetObject = objectUnderMouse();
        }
      }
      draw() {
        drawObjectHighlight(this.targetObject);
      }
    }
  }[name];
}

const tools = [
  createMarkerClass('Draw', 3, 'source-over'),
  createMarkerClass('Erase', 30, 'destination-out'),
  class Cut {
    constructor() {
      this.points = [];
    }
    handleDown() {
      this.points = [[mouseX, mouseY]];
    }
    handleMove() {
      if (mouseDragging) {
        this.points.push([mouseX, mouseY]);
      }
    }
    handleUp() {
      if (this.points.length > 2) {
        let minX = this.points[0][0];
        let minY = this.points[0][1];
        let maxX = minX;
        let maxY = minY;
        for (const [x, y] of this.points) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;

        const newObject = {
          x: minX,
          y: minY,
          canvas: new OffscreenCanvas(boxWidth, boxHeight),
          maskCanvas: new OffscreenCanvas(boxWidth, boxHeight),
        };
        newObject.context = newObject.canvas.getContext('2d');
        newObject.maskContext = newObject.maskCanvas.getContext('2d');
        objects.push(newObject);

        // Draw drawing new object.
        newObject.context.drawImage(sketchCanvas, -minX, -minY);

        // Remove drawing cut from background.
        sketchContext.globalCompositeOperation = 'destination-out';
        sketchContext.fillStyle = 'black';
        this.drawCut(sketchContext, 0, 0);

        // Clip drawing to cut shape.
        newObject.context.globalCompositeOperation = 'destination-in';
        newObject.context.fillStyle = 'black';
        this.drawCut(newObject.context, -minX, -minY);

        // Draw mask.
        newObject.maskContext.fillStyle = '#0000ff0a';
        this.drawCut(newObject.maskContext, -minX, -minY);
        
        // Switch to move tool.
        selectedIndex++;
        selectedTool = new tools[selectedIndex]();
      }
      this.points = [];
    }
    drawCut(context, translateX, translateY) {
      if (this.points.length < 2) {
        return;
      }
      context.beginPath();
      context.moveTo(this.points[0][0] + translateX, this.points[0][1] + translateY);
      for (const [x, y] of this.points) {
        context.lineTo(x + translateX, y + translateY);
      }
      context.fill();
    }
    draw() {
      pageContext.fillStyle = '#00f2';
      this.drawCut(pageContext, 0, 0);
    }
  },
  class Move {
    constructor() {
      this.targetObject = objectUnderMouse(false);
      this.originalX = 0;
      this.originalY = 0;
    }
    handleDown() {
      if (this.targetObject) {
        this.originalX = this.targetObject.x;
        this.originalY = this.targetObject.y;
      }
    }
    handleMove() {
      if (mouseDragging) {
        if (this.targetObject) {
          this.targetObject.x = this.originalX + mouseX - dragStartX;
          this.targetObject.y = this.originalY + mouseY - dragStartY;
        }
      } else {
        this.targetObject = objectUnderMouse(false);
      }
    }
    draw() {
      drawObjectHighlight(this.targetObject);
    }
  },
  class Delete {
    constructor() {
      this.targetObject = objectUnderMouse(false);
    }
    handleMove() {
      this.targetObject = objectUnderMouse(false);
    }
    handleDown() {
      if (this.targetObject) {
        objects.splice(objects.indexOf(this.targetObject), 1);
        this.targetObject = null;
      }
    }
    draw() {
      drawObjectHighlight(this.targetObject);
    }
}];
const toolWidth = width / tools.length;
const toolHeight = 50;
let selectedTool = new tools[0]();
let selectedIndex = 0;

function objectUnderMouse(includeBackgroundObject=true) {
  let result = includeBackgroundObject ? sketchObject : null;
  for (const object of objects) {
    const {x, y, canvas, maskContext} = object;
    if (mouseX < x || mouseX >= x + canvas.width || mouseY < y || mouseY >= y + canvas.height) {
      continue;
    }
    const alpha = maskContext.getImageData(mouseX - x, mouseY - y, 1, 1).data[3];
    if (alpha > 0) {
      result = object;
    }
  }
  return result;
}

function registerMouseEvents() {
  window.addEventListener('mousemove', event => {
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    if (mouseY > toolHeight) {
      selectedTool?.handleMove?.();
    }
  });
  window.addEventListener('mousedown', event => {
    mouseDragging = true;
    dragStartX = mouseX;
    dragStartY = mouseY;
    if (mouseY <= toolHeight) {
      selectedIndex = Math.floor(mouseX / toolWidth);
      selectedTool = new tools[selectedIndex]();
    } else {
      selectedTool?.handleDown?.();
    }
  });
  window.addEventListener('mouseup', event => {
    mouseDragging = false;
    selectedTool?.handleUp?.();
  });
  window.addEventListener('wheel', event => {
    if (!mouseDragging) {
      selectedIndex = (tools.length + selectedIndex + Math.sign(event.deltaY)) % tools.length;
      selectedTool = new tools[selectedIndex]();
    }
  });
}

function drawCommands() {
  pageContext.strokeStyle = 'black';
  pageContext.font = '20px sans-serif';
  for (let i = 0; i < tools.length; ++i) {
    if (i == selectedIndex) {
      pageContext.fillStyle = '#00f3';
      pageContext.fillRect(i * toolWidth, 0, toolWidth, toolHeight);
    }
    pageContext.strokeRect(i * toolWidth, 0, toolWidth, toolHeight);
    pageContext.fillStyle = 'black';
    pageContext.fillText(tools[i].name, (i + 0.5) * toolWidth - tools[i].name.length * 6, toolHeight / 2 + 6);
  }
}

function drawObjectHighlight(object) {
  if (!object || object == sketchObject) {
    return;
  }
  pageContext.drawImage(object.maskCanvas, object.x, object.y);
}

function draw() {
  pageContext.clearRect(0, 0, width, height);
  pageContext.drawImage(sketchCanvas, 0, 0);
  for (const object of objects) {
    pageContext.opacity = 0.5;
    pageContext.drawImage(object.maskCanvas, object.x, object.y);
    pageContext.opacity = 1;
    pageContext.drawImage(object.canvas, object.x, object.y);
  }
  selectedTool?.draw?.();
  drawCommands();
}

async function main() {
  registerMouseEvents();
  while (true) {
    await new Promise(requestAnimationFrame);
    draw();
  }
}
main();