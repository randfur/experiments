import {dom, updateNodeDom, updateNodeEdgesDom} from '../dom.js';
import {kMouseDragStart, kMouseDragMove, kMouseDragEnd, kButtonRight, mouse} from '../input.js';
import {getElementUnderMouse} from '../utils.js';
import {worldMouse} from '../camera.js';
import {getConnectedNodes, getSubTreeNodes} from '../model.js';
import {kModeEditText, editTextFinish} from './edit-text.js';
import {selectedNodes} from '../selection.js';


const kModeMoveNodes = Symbol('ModeMoveNodes');


export function getMoveNodesActions(inputState) {
  const actions = [];

  if (!inputState.mode || inputState.mode === kModeEditText) {
    const nodeMiddleElement = getElementUnderMouse('nodeMiddle');
    if (nodeMiddleElement) {
      actions.push({
        eventType: kMouseDragStart,
        button: kButtonRight,
        blocking: true,
        name: 'Move node',
        execute() {
          if (inputState.mode === kModeEditText) {
            const {deleted} = editTextFinish(inputState);
            if (deleted) {
              return;
            }
          }
          const rootMovingNodeSet = new Set(selectedNodes.size > 0 ? [...selectedNodes] : [nodeMiddleElement.node]);
          const actualMovingNodeSet = new Set();
          for (const rootMovingNode of rootMovingNodeSet) {
            if (rootMovingNode.collapsed) {
              for (const subNode of getSubTreeNodes(rootMovingNode)) {
                actualMovingNodeSet.add(subNode);
              }
            } else {
              actualMovingNodeSet.add(rootMovingNode);
            }
          }
          inputState.setMode(kModeMoveNodes, {
            movingNodes: Array.from(actualMovingNodeSet).map(node => ({
              node,
              x: node.x,
              y: node.y,
            })),
            worldMouseX: worldMouse.x,
            worldMouseY: worldMouse.y,
          });
        },
      });
    }
  }

  if (inputState.mode === kModeMoveNodes) {
    actions.push({
      eventType: kMouseDragMove,
      button: kButtonRight,
      blocking: true,
      name: 'Move node',
      execute() {
        const {movingNodes, worldMouseX, worldMouseY} = inputState.dataForMode(kModeMoveNodes);
        const affectedNodes = new Set();
        for (const {node, x, y} of movingNodes) {
          node.x = x + (worldMouse.x - worldMouseX);
          node.y = y + (worldMouse.y - worldMouseY);
          updateNodeDom(node);
          for (const connectedNode of getConnectedNodes(node)) {
            affectedNodes.add(connectedNode);
          }
        }
        for (const affectedNode of affectedNodes) {
          updateNodeEdgesDom(affectedNode);
        }
      },
    });

    actions.push({
      eventType: kMouseDragEnd,
      button: null,
      blocking: true,
      name: 'Stop moving node',
      execute() {
        inputState.clear();
      },
    });
  }
  
  return actions;
}
