import {kMouseDragStart, kMouseDragEnd, kButtonRight} from '../input.js';
import {getElementUnderMouse} from '../utils.js';
import {nodes, attachNodes, unattachNodes} from '../model.js';
import {dom, updateNodeEdgesDom, createEdge} from '../dom.js';
import {createNodeAction} from './create-node.js';
import {kModeEditText, editTextFinish} from './edit-text.js';
import {kSizeStep} from './node-menu/size-nodes.js';


const kModeAttachNodes = Symbol('ModeAttachNodes');


export function getAttachNodesActions(inputState) {
  const actions = [];

  if (!inputState.mode || inputState.mode == kModeEditText) {
    const nodeRightElement = getElementUnderMouse('nodeRight');
    if (nodeRightElement) {
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
          inputState.setMode(kModeAttachNodes, {node: nodeRightElement.node});
        },
      });
    }
  }

  if (inputState.mode === kModeAttachNodes) {
    const {node} = inputState.dataForMode(kModeAttachNodes);
    const otherNode = getElementUnderMouse('node')?.node;
    if (otherNode) {
      if (otherNode.attachedFromId === node.id) {
        actions.push({
          eventType: kMouseDragEnd,
          button: kButtonRight,
          blocking: true,
          name: 'Unattach nodes',
          execute(event) {
            unattachNodes(node, otherNode);
            updateNodeEdgesDom(node);
            inputState.clear();
          },
        });
      } else {
        actions.push({
          eventType: kMouseDragEnd,
          button: kButtonRight,
          blocking: true,
          name: 'Attach nodes',
          execute(event) {
            const from = node;
            const to = otherNode;
            const lastFromAttachedFromId = from.attachedFromId;
            const lastToAttachedFromId = to.attachedFromId;
            attachNodes(from, to);
            updateNodeEdgesDom(from);
            updateNodeEdgesDom(to);
            if (lastFromAttachedFromId !== null) {
              updateNodeEdgesDom(nodes[lastFromAttachedFromId]);
            }
            if (lastToAttachedFromId !== null) {
              updateNodeEdgesDom(nodes[lastToAttachedFromId]);
            }
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
          attachNodes(node, newNode);
          updateNodeEdgesDom(node);
        },
      });
    }
    
  }

  return actions;
}