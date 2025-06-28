import {nodes, addloadedNode, compressNode, decompressNode} from './model.js';
import {updateNodeDom, updateNodeEdgesDom} from './dom.js';


export function serialise(nodes) {
  const compressedNodes = [];
  for (const node of Object.values(nodes)) {
    compressedNodes.push(compressNode(node));
  }
  return JSON.stringify(compressedNodes);
}

function deserialise(compressedNodesJson) {
  return JSON.parse(compressedNodesJson).map(decompressNode);
}

function loadData(data) {
  for (const id in nodes) {
    delete nodes[id];
  }
  for (const node of deserialise(data)) {
    addloadedNode(node);
  }
  for (const node of Object.values(nodes)) {
    updateNodeDom(node);
  }
  for (const node of Object.values(nodes)) {
    updateNodeEdgesDom(node);
  }
}

export function load() {
  const data = localStorage.getItem('compressedNodes');
  if (data) {
    loadData(data);
  }
}

export function save() {
  localStorage.setItem('compressedNodes', serialise(nodes));
}
