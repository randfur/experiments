import {kMouseDragStart, kMouseDragMove, kMouseDragEnd, kButtonRight, mouse} from '../../input.js';
import {dom, getMidX, getMidY, updateNodeDom, updateNodeEdgesDom} from '../../dom.js';
import {getConnectedNodes} from '../../model.js';
import {selectedNodes} from '../../selection.js';

const kModeSizeNodes = Symbol('ModeSizeNodes');

export const kSizeStep = 14;


export const sizeNodesMenuOption = {
  getName(node) { return 'Size'; },

  eventType: kMouseDragStart,

  execute(node, inputState) {
    const sizingNodes = new Set(selectedNodes);
    sizingNodes.add(node);
    const affectedNodes = new Set();
    for (const node of sizingNodes) {
      for (const affectedNode of getConnectedNodes(node)) {
        affectedNodes.add(affectedNode);
      }
    }
    inputState.setMode(kModeSizeNodes, {
      mouseX: mouse.x,
      initialSize: node.size,
      sizingNodes,
      affectedNodes,
    });
  },
  
  getExecutingActions(inputState) {
    const actions = [];
    
    if (inputState.mode == kModeSizeNodes) {
      actions.push({
        eventType: kMouseDragMove,
        button: kButtonRight,
        blocking: true,
        name: 'Size nodes',
        execute(event) {
          const {mouseX, initialSize, sizingNodes, affectedNodes} = inputState.dataForMode(kModeSizeNodes);
          const change = (mouse.x - mouseX) / 4;
          for (const node of sizingNodes) {
            node.size = Math.max(kSizeStep, Math.round((initialSize + change) / kSizeStep) * kSizeStep);
            const nodeElement = dom.nodes[node.id];
            const oldMidX = getMidX(nodeElement);
            const oldMidY = getMidY(nodeElement);
            updateNodeDom(node);
            node.x += oldMidX - getMidX(nodeElement);
            node.y += oldMidY - getMidY(nodeElement);
            updateNodeDom(node);
          }
          for (const node of affectedNodes) {
            updateNodeEdgesDom(node);
          }
        },
      });

      actions.push({
        eventType: kMouseDragEnd,
        button: kButtonRight,
        blocking: true,
        name: 'Finish sizing nodes',
        execute(event) {
          inputState.clear();
        },
      });
    }
    
    return actions;
  }
};