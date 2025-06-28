import {kMouseClick} from '../../input.js';
import {updateNodeDom, updateNodeEdgesDom} from '../../dom.js';
import {nodes, getSubTreeNodes} from '../../model.js';


export const collapseNodeMenuOption = {
  getName(node) { return node.collapsed ? 'Expand' : 'Collapse'; },

  eventType: kMouseClick,

  execute(node, inputState) {
    node.collapsed ^= true;

    const subTreeNodes = getSubTreeNodes(node);
    const nodesToUpdate = new Set();
    for (const subTreeNode of subTreeNodes) {
      nodesToUpdate.add(subTreeNode);
      for (const associatedFromId of subTreeNode.associatedFromIds) {
        nodesToUpdate.add(nodes[associatedFromId]);
      }
    }
    for (const node of nodesToUpdate) {
      updateNodeDom(node);
    }
    for (const node of nodesToUpdate) {
      updateNodeEdgesDom(node);
    }
  },

  getExecutingActions(inputState) {
    return [];
  },
};
