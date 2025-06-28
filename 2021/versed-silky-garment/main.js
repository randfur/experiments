const TAU = Math.PI * 2;
export const width = window.innerWidth;
export const height = window.innerHeight;
export const canvas = document.getElementById('canvas');
export const context = canvas.getContext('2d');

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function randomRange(a, b) {
  return Math.random() * (b - a) + a;
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function growCircle(destCircle, newCircle) {
  const x = destCircle.x;
  const y = destCircle.y;
  const deltaX = newCircle.x - x;
  const deltaY = newCircle.y - y;
  if (deltaX == 0 && deltaY == 0) {
    destCircle.radius = Math.max(destCircle.radius, newCircle.radius);
    return;
  }
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const dirX = deltaX / distance;
  const dirY = deltaY / distance;
  
  let minT = 0;
  let minX = x;
  let minY = y;

  let maxT = 0;
  let maxX = x;
  let maxY = y;
  
  for (const circle of [destCircle, newCircle]) {
    for (const direction of [1, -1]) {
      const testX = circle.x + direction * circle.radius * dirX;
      const testY = circle.y + direction * circle.radius * dirY;
      const t = (testX - x) * dirX + (testY - y) * dirY;
      if (t < minT) {
        minT = t;
        minX = testX;
        minY = testY;
      } else if (t > maxT) {
        maxT = t;
        maxX = testX;
        maxY = testY;
      }
    }
  }
  
  destCircle.x = (minX + maxX) / 2;
  destCircle.y = (minY + maxY) / 2;
  destCircle.radius = (maxT - minT) / 2;
}

function getAreaAdded(circle, newCircle) {
  const {x, y, radius} = circle;
  const oldArea = TAU * radius ** 2 / 2;
  growCircle(circle, newCircle);
  const newArea = TAU * circle.radius ** 2 / 2;
  circle.x = x;
  circle.y = y;
  circle.radius = radius;
  return newArea - oldArea;
}

const maxLeafCircles = 5;

function newCircleTree(circle) {
  return {
    x: circle.x,
    y: circle.y,
    radius: circle.radius,
    leaf: true,
    children: [circle],
  };
}

function addCircleToTree(node, circle) {
  if (!node) {
    return newCircleTree(circle);
  }

  if (node.leaf) {
    if (node.children.length < maxLeafCircles) {
      node.children.push(circle);
      growCircle(node, circle);
      return node;
    }

    node.leaf = false;
    const newChildren = [];
    for (const circle of node.children) {
      newChildren.push(newCircleTree(circle));
    }
    node.children = newChildren;
  }

  let minAreaAdded = Infinity;
  let minChild = null;
  for (const child of node.children) {
    const areaAdded = getAreaAdded(child, circle);
    if (areaAdded < minAreaAdded) {
      minChild = child;
      minAreaAdded = areaAdded;
    }
  }
  addCircleToTree(minChild, circle);
  growCircle(node, minChild);
  
  return node;
}

async function main() {
  canvas.width = width;
  canvas.height = height;
  
  let treeRoot = null;
  
  const circles = [];
  const count = 100;
  for (let i of range(count)) {
    const circle = {
      // x: width / 2 + Math.sin(i / count * TAU) * 200,
      // y: height / 2 - Math.cos(i / count * TAU) * 200,
      x: randomRange(0.4, 0.6) * width,
      y: randomRange(0.4, 0.6) * height,
      dx: deviate(1),
      dy: deviate(1),
      radius: 6,
    };
    circles.push(circle);
  }

  function drawNode(node, depth=0) {
    context.strokeStyle = `rgb(0, ${depth * 40}, 255)`;
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, TAU);
    context.stroke();
    if (node.children && node.children.length > 1) {
      for (const child of node.children) {
        drawNode(child, depth + 1);
      }
    }
  }
  
  function draw() {
    context.clearRect(0, 0, width, height);
    drawNode(treeRoot);
  }

  while (true) {
    await new Promise(requestAnimationFrame);

    treeRoot = null;
    for (const circle of circles) {
      circle.x += circle.dx;
      circle.y += circle.dy;
      treeRoot = addCircleToTree(treeRoot, circle);
    }
  
    draw();
  }
}

main();