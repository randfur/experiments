import {removeItem} from '../utils.js';

export class Collision {
  #colliders;
  #nextColliderId;
  #branchingFactor;
  #nodePool;
  #nextNodeIndex;
  #collisionTree;
  #collisionsResult;

  constructor({game, branchingFactor, drawing}) {
    this.#colliders = [];
    this.#nextColliderId = 0;
    this.#branchingFactor = branchingFactor;
    this.#nodePool = [];
    this.#nextNodeIndex = 0;
    this.#collisionTree = null;
    this.#collisionsResult = [];

    // // Debug draw the collision tree.
    // game.do(async job => {
    //   function drawNode(node, context, depth) {
    //     if (!node) {
    //       return;
    //     }
    //     context.strokeStyle = `rgb(${depth * 50}, 255, 0)`;
    //     context.strokeRect(node.minX, node.minY, node.maxX - node.minX, node.maxY - node.minY);
    //     for (const child of node.children) {
    //       drawNode(child, context, depth + 1);
    //     }
    //   }
    //   game.drawing.register(job, context => drawNode(this.#collisionTree, context, 0));
    //   await job.forever();
    // });

    function passesFilter(collider, otherCollider) {
      return collider.typeFilter === null || collider.typeFilter.some(type => otherCollider.job instanceof type);
    }

    (async () => {
      while (!game.isDone) {
        await game.nextTick;
        this.#rebuildCollisionTree();
        for (const collider of this.#colliders) {
          if (!collider.enabled) {
            continue;
          }
          for (const otherCollider of this.getCollisions(collider, /*idCheck=*/true)) {
            if (passesFilter(collider, otherCollider)) { collider.collisionFunc(otherCollider.job, otherCollider); }
            if (passesFilter(otherCollider, collider)) { otherCollider.collisionFunc(collider.job, collider); }
          }
        }
      }
    })();
  }
  
  register(job, collisionFunc) {
    const collider = {
      id: this.#nextColliderId++,
      enabled: true,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      job,
      collisionFunc,
      typeFilter: null,
    };
    
    this.#colliders.push(collider);
    job.addCleanUp(() => removeItem(this.#colliders, collider));

    return collider;
  }
  
  #rebuildCollisionTree() {
    this.#releaseAllNodes();
    this.#collisionTree = this.#getNextNode();

    for (const collider of this.#colliders) {
      if (collider.enabled) {
        this.#addToSubtree(this.#collisionTree, collider);
      }
    }
  }
    
  #addToSubtree(root, collider) {
    // At leaf node.
    // Convert to branching node.
    if (root.collider) {
      let node = this.#getNextNode();
      node.collider = root.collider;
      this.#growNode(node, root.collider);
      root.collider = null;
      root.children.push(node);
      
      node = this.#getNextNode();
      node.collider = collider;
      this.#growNode(node, collider);
      this.#growNode(root, collider);
      root.children.push(node);
      return;
    }
    
    // Has room to grow.
    // Add to children.
    if (root.children.length < this.#branchingFactor) {
      const node = this.#getNextNode();
      node.collider = collider;
      this.#growNode(node, collider);
      this.#growNode(root, collider);
      root.children.push(node);
      return;
    }

    // At limit.
    // Push into child node.
    let minAreaAdded = Infinity;
    let bestChild = null;
    for (const child of root.children) {
      const areaAdded = this.#nodeColliderArea(child, collider) - this.#nodeArea(child);
      if (areaAdded < minAreaAdded) {
        minAreaAdded = areaAdded;
        bestChild = child;
      }
    }
    this.#growNode(root, collider);
    this.#addToSubtree(bestChild, collider);
  }

  #releaseAllNodes() {
    this.#nextNodeIndex = 0;
  }

  #getNextNode() {
    while (this.#nodePool.length <= this.#nextNodeIndex) {
      this.#nodePool.push({
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
        maxId: null,
        collider: null,
        children: [],
      });
    }
    const node = this.#nodePool[this.#nextNodeIndex++];
    node.minX = Infinity;
    node.maxX = -Infinity;
    node.minY = Infinity;
    node.maxY = -Infinity;
    node.maxId = null;
    node.collider = null;
    node.children.length = 0;
    return node;
  }
  
  #growNode(node, collider) {
    node.minX = Math.min(node.minX, collider.x);
    node.maxX = Math.max(node.maxX, collider.x + collider.width);
    node.minY = Math.min(node.minY, collider.y);
    node.maxY = Math.max(node.maxY, collider.y + collider.height);
    node.maxId = Math.max(node.maxId, collider.id);
  }
  
  #nodeColliderArea(node, collider) {
    const width = Math.max(node.maxX, collider.x + collider.width) - Math.min(node.minX, collider.x);
    const height = Math.max(node.maxY, collider.y + collider.height) - Math.min(node.minY, collider.y);
    return width * height;
  }
  
  #nodeArea(node) {
    return (node.maxX - node.minX) * (node.maxY - node.minY);
  }
  
  getCollisions(collider, idCheck=false) {
    this.#collisionsResult.length = 0;
    this.#accumulateCollisions(collider, idCheck, this.#collisionTree, this.#collisionsResult)
    return this.#collisionsResult;
  }
  
  #accumulateCollisions(collider, idCheck, node, result) {
    if (idCheck && collider.id > node.maxId) {
      return;
    }
    if (node !== this.#collisionTree && !this.#overlapping(node, collider)) {
      return;
    }
    if (node.collider && node.collider !== collider) {
      result.push(node.collider);
      return;
    }
    for (const child of node.children) {
      this.#accumulateCollisions(collider, idCheck, child, result);
    }
  }
  
  #overlapping(node, collider) {
    return collider.x < node.maxX
        && (collider.x + collider.width) > node.minX
        && collider.y < node.maxY
        && (collider.y + collider.height) > node.minY;
  }
}
