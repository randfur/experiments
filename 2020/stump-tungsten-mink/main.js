const backgroundColour = 'white';
const lineColour = 'black';
const dotColour = 'lime';

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');
context.strokeStyle = lineColour;

function createNode(parent) {
  return {
    x: null,
    y: null,
    width: null,
    height: null,
    parent,
    children: [],
  };
}

function layout(node, depth=0) {
  if (node.children.length == 0) {
    node.width = 2;
    node.height = 2;
    return;
  }
  let distance = 0;
  let crossDistance = 0;
  const mainAxis = ((depth + (height > width)) % 2) == 0 ? 'x' : 'y';
  const mainLength = mainAxis == 'x' ? 'width' : 'height';
  const crossAxis = mainAxis == 'x' ? 'y' : 'x';
  const crossLength = mainAxis == 'x' ? 'height' : 'width';
  for (const child of node.children) {
    layout(child, depth + 1);
    child[mainAxis] = distance;
    child[crossAxis] = 0;
    distance += child[mainLength] + 2;
    crossDistance = Math.max(crossDistance, child[crossLength]);
  }
  node[mainLength] = distance + 2;
  node[crossLength] = crossDistance + 4;
}

function draw(node, x=1.5, y=1.5) {
  context.strokeRect(x + node.x, y + node.y, node.width, node.height);
  if (node.children.length == 0)
    context.fillRect(x + node.x + 0.5, y + node.y + 0.5, node.width - 1, node.height - 1);
  for (const child of node.children)
    draw(child, x + node.x + 2, y + node.y + 2);
}

const root = createNode(null);
const nodes = [root];

function removeItem(array, item) {
  array.splice(array.indexOf(item), 1);
}

function removeNode(node, cleanParent=true) {
  if (cleanParent)
    removeItem(node.parent.children, node);
  removeItem(nodes, node);
  for (const child of node.children)
    removeNode(child, false);
}

async function main() {
  while (true) {
    await new Promise(requestAnimationFrame);

    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    const newNode = createNode(randomNode);
    randomNode.children.push(newNode);
    nodes.push(newNode);
    
    if (root.width > width || root.height > height)
      removeNode(nodes[1 + Math.floor(Math.random() * (nodes.length - 1))]);

    layout(root);

    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, width, height);
    context.fillStyle = dotColour;
    draw(root);
  }
}
main();