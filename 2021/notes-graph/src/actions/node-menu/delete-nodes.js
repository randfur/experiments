import {kMouseClick} from '../../input.js';
import {removeNode, getConnectedNodes, nodes} from '../../model.js';
import {removeNodeDom, updateNodeEdgesDom} from '../../dom.js';
import {selectedNodes} from '../../selection.js';


export const deleteNodesMenuOption = {
  getName(node) { return 'Delete'; },

  eventType: kMouseClick,

  execute(node, inputState) {
    if (selectedNodes.size == 0) {
      selectedNodes.add(node);
    }
    const affectedNodes = new Set();
    for (const selectedNode of selectedNodes) {
      for (const node of getConnectedNodes(selectedNode)) {
        affectedNodes.add(node);
      }
    }
    for (const node of selectedNodes) {
      removeNode(node);
      removeNodeDom(node.id);
    }
    for (const affectedNode of affectedNodes) {
      if (affectedNode.id in nodes) {
        updateNodeEdgesDom(affectedNode);
      }
    }
  },
};