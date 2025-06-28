import {createNodeAction} from './create-node.js';
import {kModeEditText, editTextFinish} from './edit-text.js';
import {getElementUnderMouse} from '../utils.js';
import {kMouseDragStart, kMouseDragMove, kMouseDragEnd, kButtonRight} from '../input.js';
import {associateNodes, unassociateNodes} from '../model.js';
import {updateNodeEdgesDom} from '../dom.js';
import {kSizeStep} from './node-menu/size-nodes.js';


const kModeAssociateNodes = Symbol('ModeAssociateNodes');


export function getAssociateNodesActions(inputState) {
  const actions = [];

  if (!inputState.mode || inputState.mode == kModeEditText) {
    const nodeLeftElement = getElementUnderMouse('nodeLeft');
    if (nodeLeftElement) {
      actions.push({
        eventType: kMouseDragStart,
        button: kButtonRight,
        blocking: true,
        name: 'Attach nodes',
        execute(event) {
          if (inputState.mode === kModeEditText) {
            const {deleted} = editTextFinish(inputState);
            if (deleted) {
              return;
            }
          }
          inputState.setMode(kModeAssociateNodes, {node: nodeLeftElement.node});
        },
      });
    }
  }

  if (inputState.mode === kModeAssociateNodes) {
    const {node} = inputState.dataForMode(kModeAssociateNodes);
    const otherNode = getElementUnderMouse('node')?.node;
    if (otherNode) {
      if (node.associatedToIds.includes(otherNode.id)) {
        actions.push({
          eventType: kMouseDragEnd,
          button: kButtonRight,
          blocking: true,
          name: 'Unassociate nodes',
          execute(event) {
            unassociateNodes(node, otherNode);
            updateNodeEdgesDom(node);
            inputState.clear();
          },
        });
      } else {
        actions.push({
          eventType: kMouseDragEnd,
          button: kButtonRight,
          blocking: true,
          name: 'Associate nodes',
          execute(event) {
            const from = node;
            const to = otherNode;
            associateNodes(from, to);
            updateNodeEdgesDom(from);
            updateNodeEdgesDom(to);
            inputState.clear();
          },
        });
      }
    } else {
      actions.push({
        eventType: kMouseDragEnd,
        button: kButtonRight,
        blocking: true,
        name: 'Create child node',
        execute(event) {
          const newNode = createNodeAction(inputState, {
            size: Math.max(kSizeStep, node.size - kSizeStep),
            hue: node.hue,
          });
          associateNodes(node, newNode);
          updateNodeEdgesDom(node);
        },
      });
    }
    
  }

  return actions;
}