import {removeItem} from './utils.js';
import {selectedNodes} from './selection.js';


export const nodeFields = [{
  name: 'id',
  index: 0,
  getDefaultValue() { return null; },
}, {
  name: 'x',
  index: 1,
  getDefaultValue() { return 0; },
  compress: Math.round,
}, {
  name: 'y',
  index: 2,
  getDefaultValue() { return 0; },
  compress: Math.round,
}, {
  name: 'text',
  index: 3,
  getDefaultValue() { return ''; },
}, {
  name: 'attachedToIds',
  index: 4,
  getDefaultValue() { return []; },
}, {
  name: 'attachedFromId',
  index: 5,
  getDefaultValue() { return null; },
}, {
  name: 'associatedToIds',
  index: 6,
  getDefaultValue() { return []; },
}, {
  name: 'associatedFromIds',
  index: 7,
  getDefaultValue() { return []; },
}, {
  name: 'hue',
  index: 8,
  getDefaultValue() { return 240; },
}, {
  name: 'size',
  index: 9,
  getDefaultValue() { return 14; },
}, {
  name: 'marked',
  index: 10,
  getDefaultValue() { return false; },
}, {
  name: 'collapsed',
  index: 11,
  getDefaultValue() { return false; },
}];

export let nodes = {};

let nextNodeId = 1;


function createNode() {
  const node = {};
  for (const {name, getDefaultValue} of nodeFields) {
    node[name] = getDefaultValue();
  }
  return node;
}

export function compressNode(node) {
  const compressedNode = [];
  for (const {name, index, compress} of nodeFields) {
    const value = node[name];
    compressedNode[index] = compress ? compress(value) : value;
  }
  return compressedNode;
}

export function decompressNode(compressedNode) {
  const node = {};
  for (const {name, index, getDefaultValue} of nodeFields) {
    const compressedValue = compressedNode[index];
    node[name] = (compressedValue === undefined) ? getDefaultValue() : compressedValue;
  }
  return node;
}

export function addloadedNode(loadedNode) {
  const node = createNode();
  for (const key in node) {
    node[key] = loadedNode[key] || node[key];
  }
  nodes[node.id] = node;
  nextNodeId = Math.max(node.id + 1, nextNodeId);
}

export function addNode() {
  const node = createNode();
  node.id = nextNodeId++;
  nodes[node.id] = node;
  return node;
}

export function attachNodes(from, to) {
  if (from === to) {
    return;
  }

  unassociateNodes(from, to);
  unassociateNodes(to, from);

  if (to.attachedFromId !== null) {
    removeItem(nodes[to.attachedFromId].attachedToIds, to.id);
  }

  let ancestorId = from.attachedFromId;
  while (ancestorId !== null) {
    if (ancestorId === to.id) {
      removeItem(nodes[from.attachedFromId].attachedToIds, from.id);
      from.attachedFromId = null;
      break;
    }
    ancestorId = nodes[ancestorId].attachedFromId;
  }
  
  to.attachedFromId = from.id;
  if (!from.attachedToIds.includes(to.id)) {
    from.attachedToIds.push(to.id);
  }
}

export function unattachNodes(from, to) {
  if (to.attachedFromId !== from.id) {
    return;
  }
  removeItem(from.attachedToIds, to.id);
  to.attachedFromId = null;
}

export function associateNodes(from, to) {
  if (from === to) {
    return;
  }

  unattachNodes(from, to);
  unattachNodes(to, from);
  unassociateNodes(to, from);
  
  if (!from.associatedToIds.includes(to.id)) {
    from.associatedToIds.push(to.id);
  }
  
  if (!to.associatedFromIds.includes(from.id)) {
    to.associatedFromIds.push(from.id);
  }
}

export function unassociateNodes(from, to) {
  removeItem(from.associatedToIds, to.id);
  removeItem(to.associatedFromIds, from.id);
}

export function getConnectedNodes(node) {
  return new Set([
    node,
    ...(node.attachedFromId !== null ? [nodes[node.attachedFromId]] : []),
    ...node.attachedToIds.map(id => nodes[id]),
    ...node.associatedToIds.map(id => nodes[id]),
    ...node.associatedFromIds.map(id => nodes[id]),
  ]);
}

export function getSubTreeNodes(node) {
  const subTree = new Set();
  function traverse(currentNode) {
    subTree.add(currentNode);
    for (const attachedToId of currentNode.attachedToIds) {
      traverse(nodes[attachedToId]);
    }
  }
  traverse(node);
  return subTree;
}

export function removeNode(node) {
  selectedNodes.delete(node);
  for (const otherNode of Object.values(nodes)) {
    removeItem(otherNode.attachedToIds, node.id);
    removeItem(otherNode.associatedToIds, node.id);
    removeItem(otherNode.associatedFromIds, node.id);
    if (otherNode.attachedFromId === node.id) {
      if (node.attachedFromId) {
        attachNodes(nodes[node.attachedFromId], otherNode);
      } else {
        otherNode.attachedFromId = null;
      }
    }
  }
  delete nodes[node.id];
}

export function getVisibleAncestor(node) {
  let result = node;

  while (true) {
    if (node.collapsed) {
      result = node;
    }
    if (node.attachedFromId === null) {
      break;
    }
    node = nodes[node.attachedFromId];
  }

  return result;
}

export function isNodeVisible(node) {
  return getVisibleAncestor(node) === node;
}
