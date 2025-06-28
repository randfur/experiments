import {nodes, isNodeVisible} from './model.js';
import {syncLists, filterList, setClass, computeArrowPosition} from './utils.js';
import {selectedNodes} from './selection.js';


export const dom = {
  root: null,
  graphLayer: null,
  edgeLayer: null,
  nodeLayer: null,
  graphMenuLayer: null,
  hudLayer: null,
  debugLayer: null,
  nodes: {},
  attachmentEdges: {},
  associationEdges: {},
};


export function initDom(root) {
  dom.root = root;
  dom.root.classList.add('root');

  { // Graph
    dom.graphLayer = document.createElement('div');
    dom.graphLayer.classList.add('graphLayer');
    dom.root.appendChild(dom.graphLayer);
    
    dom.edgeLayer = document.createElement('div');
    dom.edgeLayer.classList.add('edgeLayer');
    dom.graphLayer.appendChild(dom.edgeLayer);

    dom.nodeLayer = document.createElement('div');
    dom.nodeLayer.classList.add('nodeLayer');
    dom.graphLayer.appendChild(dom.nodeLayer);

    dom.graphMenuLayer = document.createElement('div');
    dom.graphMenuLayer.classList.add('graphMenuLayer');
    dom.graphLayer.appendChild(dom.graphMenuLayer);
  }

  { // HUD
    dom.hudLayer = document.createElement('div');
    dom.hudLayer.classList.add('hudLayer');
    dom.root.appendChild(dom.hudLayer);

    dom.hudLayer = document.createElement('div');
    dom.hudLayer.classList.add('hudLayer');
  }

  { // Debug
    dom.debugLayer = document.createElement('pre');
    dom.debugLayer.classList.add('debugLayer');
    dom.root.appendChild(dom.debugLayer);
  }
}

export function updateNodeDom(node) {
  let nodeElement = dom.nodes[node.id];
  if (!nodeElement) {
    nodeElement = document.createElement('div');
    nodeElement.classList.add('node');
    nodeElement.node = node;
    dom.nodeLayer.appendChild(nodeElement);

    const textElement = document.createElement('pre');
    textElement.classList.add('nodeText');
    textElement.node = node;
    textElement.nodeElement = nodeElement;
    nodeElement.appendChild(textElement);
    nodeElement.textElement = textElement;

    {
      const hitLayerElement = document.createElement('div');
      hitLayerElement.classList.add('nodeHitLayer');
      nodeElement.appendChild(hitLayerElement);
      nodeElement.hitLayerElement = hitLayerElement;

      const hitTargetLeftElement = document.createElement('div');
      hitTargetLeftElement.classList.add('nodeHitTarget');
      hitTargetLeftElement.classList.add('nodeLeft');
      hitTargetLeftElement.node = node;
      hitTargetLeftElement.nodeElement = nodeElement;
      hitLayerElement.appendChild(hitTargetLeftElement);

      const hitTargetMiddleElement = document.createElement('div');
      hitTargetMiddleElement.classList.add('nodeHitTarget');
      hitTargetMiddleElement.classList.add('nodeMiddle');
      hitTargetMiddleElement.node = node;
      hitTargetMiddleElement.nodeElement = nodeElement;
      hitLayerElement.appendChild(hitTargetMiddleElement);

      const hitTargetRightElement = document.createElement('div');
      hitTargetRightElement.classList.add('nodeHitTarget');
      hitTargetRightElement.classList.add('nodeRight');
      hitTargetRightElement.node = node;
      hitTargetRightElement.nodeElement = nodeElement;
      hitLayerElement.appendChild(hitTargetRightElement);
    }

    dom.attachmentEdges[node.id] = [];
    dom.associationEdges[node.id] = [];
    dom.nodes[node.id] = nodeElement;
  }

  nodeElement.style.transform = `translate(${node.x}px, ${node.y}px)`;
  nodeElement.style.setProperty('--hue', `${node.hue}deg`);
  nodeElement.textElement.textContent = node.text;
  nodeElement.textElement.style.fontSize = `${node.size}px`;
  setClass(nodeElement, 'selected', selectedNodes.has(node));
  setClass(nodeElement, 'marked', node.marked);
  setClass(nodeElement, 'collapsed', node.collapsed);
  setClass(nodeElement, 'hidden', !isNodeVisible(node));
}

export function updateNodeEdgesDom(node) {
  let nodeElement = dom.nodes[node.id];

  syncLists({
    sourceList: node.attachedToIds,
    destinationList: dom.attachmentEdges[node.id],
    createItem() {
      const edgeElement = createEdge();
      edgeElement.classList.add('attachmentEdge');
      return edgeElement;
    },
    updateItem(attachedToId, edgeElement) {
      updateOutgoingEdgeDom(edgeElement, nodeElement, attachedToId);
    },
    deleteItem(edgeElement) {
      edgeElement.remove();
    },
  });

  syncLists({
    sourceList: node.associatedToIds,
    destinationList: dom.associationEdges[node.id],
    createItem() {
      const edgeElement = createEdge();
      edgeElement.classList.add('associationEdge');
      return edgeElement;
    },
    updateItem(associatedToId, edgeElement) {
      updateOutgoingEdgeDom(edgeElement, nodeElement, associatedToId);
    },
    deleteItem(edgeElement) {
      edgeElement.remove();
    },
  });
}

export function getMidX(nodeElement) {
  return nodeElement.node.x + nodeElement.clientWidth / 2;
}

export function getMidY(nodeElement) {
  return nodeElement.node.y + nodeElement.clientHeight / 2;
}

function getCornerDistance(nodeElement) {
  return Math.sqrt(nodeElement.clientWidth ** 2 + nodeElement.clientHeight ** 2) / 2 + 10;
}

export function createEdge() {
  const edgeElement = document.createElement('div');
  edgeElement.classList.add('edge');
  const edgeArrow = document.createElement('div');
  edgeArrow.classList.add('edgeArrow');
  edgeElement.appendChild(edgeArrow);
  edgeElement.arrow = edgeArrow;
  dom.edgeLayer.appendChild(edgeElement);
  return edgeElement;
}

function updateOutgoingEdgeDom(edgeElement, fromNodeElement, toNodeId) {
  edgeElement.fromNodeId = fromNodeElement.node.id;
  edgeElement.toNodeId = toNodeId;

  const edgeIsVisible = isNodeVisible(fromNodeElement.node) && isNodeVisible(nodes[toNodeId]);
  setClass(edgeElement, 'hidden', !edgeIsVisible);
  if (edgeIsVisible) {
    placeEdgeBetweenNodes(edgeElement, fromNodeElement, dom.nodes[toNodeId]);
  }
}

function placeEdgeBetweenNodes(edgeElement, fromNodeElement, toNodeElement) {
  const midX1 = getMidX(fromNodeElement);
  const midY1 = getMidY(fromNodeElement);
  const width1 = fromNodeElement.clientWidth;
  const height1 = fromNodeElement.clientHeight;
  const midX2 = getMidX(toNodeElement);
  const midY2 = getMidY(toNodeElement);
  const width2 = toNodeElement.clientWidth;
  const height2 = toNodeElement.clientHeight;
  const deltaX = midX2 - midX1;
  const deltaY = midY2 - midY1;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const arrowPosition = computeArrowPosition(midX1, midY1, width1, height1, midX2, midY2, width2, height2, length);

  edgeElement.style.width = `${length}px`;
  edgeElement.style.transform = `translate(${midX1}px, ${midY1}px) rotate(${Math.atan2(deltaY, deltaX)}rad)`;
  edgeElement.arrow.style.setProperty('--mid-length', `${arrowPosition}px`);
}

export function removeNodeDom(nodeId) {
  dom.nodes[nodeId].remove();
  delete dom.nodes[nodeId];

  for (const edgeElement of dom.attachmentEdges[nodeId]) {
    edgeElement.remove();
  }
  delete dom.attachmentEdges[nodeId];
  for (const attachmentEdges of Object.values(dom.attachmentEdges)) {
    const removed = filterList(attachmentEdges, edgeElement => edgeElement.fromNodeId !== nodeId && edgeElement.toNodeId !== nodeId);
    for (const removedEdgeElement of removed) {
      removedEdgeElement.remove();
    }
  }

  for (const edgeElement of dom.associationEdges[nodeId]) {
    edgeElement.remove();
  }
  delete dom.associationEdges[nodeId];
  for (const associationEdges of Object.values(dom.associationEdges)) {
    const removed = filterList(associationEdges, edgeElement => edgeElement.fromNodeId !== nodeId && edgeElement.toNodeId !== nodeId);
    for (const removedEdgeElement of removed) {
      removedEdgeElement.remove();
    }
  }
}
