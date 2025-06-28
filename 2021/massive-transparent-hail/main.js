export const width = window.innerWidth;
export const height = window.innerHeight;
export const canvas = document.getElementById('canvas');
export const context = canvas.getContext('2d');

class RTree {
  static maxChildren = 5;
  
  constructor() {
    this.root = null;
  }
  
  add(x, y, width, height) {
    if (!this.root) {
      this.root = {
        parent: null,
        treeHeight: 1,
        x, y, width, height,
        children: [{
          parent: null,
          treeHeight: 0,
          x, y, width, height,
        }],
      };
      this.root.children[0].parent = this.root;
      return;
    }
    let node = this.root;
    while (true) {
      if (node.treeHeight == 1) {
        
      }
    }
  }
}

function nextEvent(...eventTypes) {
  return new Promise(resolve => {
    let handler = event => {
      resolve(event);
      for (const eventType of eventTypes) {
        window.removeEventListener(eventType, handler);
      }
    }
    for (const eventType of eventTypes) {
      window.addEventListener(eventType, handler);
    }
  });
}

async function main() {
  canvas.width = width;
  canvas.height = height;
  context.translate(0.5, 0.5);
  
  let boxes = [];
  
  function draw() {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'white';
    for (const {x, y, width, height} of boxes) {
      context.strokeRect(x, y, width, height);
    }
  }

  while (true) {
    draw();
    
    let {offsetX, offsetY} = await nextEvent('mousedown');
    let newBox = {x: offsetX, y: offsetY, width: 0, height: 0};

    function dragDraw() {
      draw();
      context.strokeStyle = 'lime';
      context.strokeRect(newBox.x, newBox.y, newBox.width, newBox.height);
    }
    dragDraw();

    while (true) {
      const event = await nextEvent('mousemove', 'mouseup');
      if (event.type == 'mousemove') {
        newBox.width = event.offsetX - newBox.x;
        newBox.height = event.offsetY - newBox.y;
        dragDraw();
      } else if (event.type == 'mouseup') {
        boxes.push(newBox)
        dragDraw();
        break;
      }
    }
  }
}

main();