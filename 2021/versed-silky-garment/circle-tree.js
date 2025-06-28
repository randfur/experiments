const nodes = [];
const nodesInUse = 0;

function getNode() {
  while (nodesInUse >= nodes.length) {
    nodes.push({
      x: 0,
      y: 0,
      radius: 0,
      maxId: 0,
      isLeaf: true,
      children: [],
    });
  }
  return nodes[nodesInUse++]
}

function getNodeForCircle(circle) {
  const node = getNode();
  node.x = circle.x;
  node.y = circle.y;
  node.radius = circle.radius;
  node.maxId = circle.id;
  node.isLeaf = true;
  node.children.length = 1;
  node.children[0] = circle;
}

export class CircleTree {
  constructor(branchSize = 4) {
    this.branchSize = branchSize;
    this.root = null;
  }

  setCircles(circles) {
    this.root = null;
    nodesInUse = 0;

    for (let i = 0; i < circles.length; ++i) {
      const circle = circles[i];
      if (i === 0) {
        this.root = getNodeForCircle(circle);
      } else {
        this.#addCircleToTree(this.root, circle);
      }
    }
  }
  
  *getCollisions() {
    
  }

  #addCircleToTree(node, circle) {
    if (node.isLeaf) {
      if (node.children.length < this.branchSize) {
        
      }
    }
  }


}