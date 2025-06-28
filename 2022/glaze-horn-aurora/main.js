const width = window.innerWidth;
const height = window.innerHeight;
const context = canvas.getContext('2d');

async function main() {
  canvas.width = width;
  canvas.height = height;
  context.lineWidth = 2;

  const nodes = range(100).map(() => ({
    position: new Vec2(random(width), random(height)),
    size: 20 + random(20),
    hue: random(360),
  }));
  let selected = null;
  async function setSelected(node) {
    selected = node;
    const steps = 100;
    for (let i of range(steps)) {
      await new Promise(requestAnimationFrame);
      context.strokeStyle = `hsla(${node.hue}deg, 100%, 50%, ${25 * (1 - i / steps)}%)`;
      const size = node.size + Math.sqrt(i) * 10;
      context.strokeRect(
        node.position.x - size / 2,
        node.position.y - size / 2,
        size,
        size,
      );
    }
  }
  
  setSelected(nodes[Math.floor(random(nodes.length))]);
  
  window.addEventListener('click', event => {
    setSelected(getNodeInDirection(selected, normalise(subtract(new Vec2(event.offsetX, event.offsetY), selected.position)), nodes));
  });
  window.addEventListener('keydown', event => {
    switch (event.code) {
      case 'ArrowUp':
        setSelected(getNodeInDirection(selected, new Vec2(0, -1), nodes));
        break;
      case 'ArrowDown':
        setSelected(getNodeInDirection(selected, new Vec2(0, 1), nodes));
        break;
      case 'ArrowLeft':
        setSelected(getNodeInDirection(selected, new Vec2(-1, 0), nodes));
        break;
      case 'ArrowRight':
        setSelected(getNodeInDirection(selected, new Vec2(1, 0), nodes));
        break;
    }
  });
  
  while (true) {
    await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);
    for (const node of nodes) {
      context[node === selected ? 'fillStyle' : 'strokeStyle'] = node === selected ? 'white' : `hsl(${node.hue}deg, 100%, 50%)`;
      context[node === selected ? 'fillRect' : 'strokeRect'](
        node.position.x - node.size / 2,
        node.position.y - node.size / 2,
        node.size,
        node.size,
      );
    }
  }
}

function sleep(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
}

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function subtract(v1, v2) {
  return new Vec2(v1.x - v2.x, v1.y - v2.y);
}

function add(v1, v2) {
  return new Vec2(v1.x + v2.x, v1.y + v2.y);
}

function multiply(v, k) {
  return new Vec2(v.x * k, v.y * k);
}

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function perpendicular(v) {
  return new Vec2(v.y, -v.x);
}

function normalise(v) {
  const length = Math.sqrt(v.x ** 2 + v.y ** 2);
  return new Vec2(v.x / length, v.y / length);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}

function getNodeInDirection(node, directionVector, nodes) {
  let bestScore = Infinity;
  let bestNode = null;
  for (const otherNode of nodes) {
    if (node === otherNode) {
      continue;
    }
    // const edgePosition = add(node.position, multiply(directionVector, node.size / 2));
    const delta = subtract(otherNode.position, node.position);
    const mainDistance = dot(directionVector, delta);
    if (mainDistance < 0) {
      continue;
    }
    const crossDistance = dot(directionVector, perpendicular(delta));
    const score = mainDistance ** 2 + (crossDistance * 4) ** 2 + node.size * (mainDistance > crossDistance);
    if (score < bestScore) {
      bestScore = score;
      bestNode = otherNode;
    }
  }
  return bestNode ?? node;
}

main();