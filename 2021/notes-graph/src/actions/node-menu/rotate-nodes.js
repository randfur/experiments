import {kMouseDragStart, kMouseDragMove, kMouseDragEnd, kButtonRight} from '../../input.js';
import {worldMouse} from '../../camera.js';
import {dom, getMidX, getMidY, updateNodeDom, updateNodeEdgesDom} from '../../dom.js';
import {getSubTreeNodes, getConnectedNodes} from '../../model.js';
import {getLength} from '../../utils.js';

const kModeRotateNodes = Symbol('ModeRotateNodes');


export const rotateNodesMenuOption = {
  getName(node) { return 'Rotate'; },

  eventType: kMouseDragStart,

  execute(node, inputState) {
    const nodeElement = dom.nodes[node.id];
    const rotatingNodes = getSubTreeNodes(node);
    rotatingNodes.delete(node);
    const initialPositions = new Map();
    const edgeAffectedNodes = new Set();
    for (const node of rotatingNodes) {
      const nodeElement = dom.nodes[node.id];
      initialPositions.set(node, {
        midX: getMidX(nodeElement),
        midY: getMidY(nodeElement),
        width: nodeElement.clientWidth,
        height: nodeElement.clientHeight,
      });
      for (const edgeAffectedNode of getConnectedNodes(node)) {
        edgeAffectedNodes.add(edgeAffectedNode);
      }
    }
    inputState.setMode(kModeRotateNodes, {
      centreX: getMidX(nodeElement),
      centreY: getMidY(nodeElement),
      mouseX: worldMouse.x,
      mouseY: worldMouse.y,
      initialPositions,
      edgeAffectedNodes,
    });
  },
  
  getExecutingActions(inputState) {
    const actions = [];
    
    if (inputState.mode == kModeRotateNodes) {
      const {
        centreX,
        centreY,
        mouseX,
        mouseY,
        initialPositions,
        edgeAffectedNodes,
      } = inputState.dataForMode(kModeRotateNodes);
      actions.push({
        eventType: kMouseDragMove,
        button: kButtonRight,
        blocking: true,
        name: 'Rotate nodes',
        execute(event) {
          const flippedStartAngle = {
            x: mouseX - centreX,
            y: mouseY - centreY,
          };
          flippedStartAngle.y *= -1;
          normalise(flippedStartAngle);

          const rotation = {
            x: worldMouse.x - centreX,
            y: worldMouse.y - centreY,
          };
          normalise(rotation);
          rotate(rotation, flippedStartAngle);
          
          for (const [node, {midX, midY, width, height}] of initialPositions.entries()) {
            const position = {
              x: midX - centreX,
              y: midY - centreY,
            };
            rotate(position, rotation);
            node.x = centreX + position.x - width / 2;
            node.y = centreY + position.y - height / 2;
            updateNodeDom(node);
          }
          for (const edgeAffectedNode of edgeAffectedNodes) {
            updateNodeEdgesDom(edgeAffectedNode);
          }
        },
      });

      actions.push({
        eventType: kMouseDragEnd,
        button: kButtonRight,
        blocking: true,
        name: 'Finish rotating nodes',
        execute(event) {
          inputState.clear();
        },
      });
    }
    
    return actions;
  }
};

function normalise(vector) {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  if (length == 0) {
    return;
  }
  vector.x /= length;
  vector.y /= length;
}

function rotate(vector, rotation) {
  // (v.x + i * v.y) * (r.x + i * r.y)
  // v.x * r.x + i * v.y * r.x + v.x * i * r.y + i * v.y * i * r.y
  // (v.x * r.x - v.y * r.y) + i * (v.x * r.y + v.y * r.x)
  const {x, y} = vector;
  vector.x = x * rotation.x - y * rotation.y;
  vector.y = x * rotation.y + y * rotation.x;
}