import {kMouseDragStart, kMouseDragMove, kMouseDragEnd, kButtonRight, mouse} from '../../input.js';
import {updateNodeDom} from '../../dom.js';
import {selectedNodes} from '../../selection.js';

const kModeColourNodes = Symbol('ModeColourNodes');


export const colourNodesMenuOption = {
  getName(node) { return 'Colour'; },

  eventType: kMouseDragStart,

  execute(node, inputState) {
    const colouringNodes = new Set(selectedNodes);
    colouringNodes.add(node);
    inputState.setMode(kModeColourNodes, {
      mouseX: mouse.x,
      initialHue: node.hue,
      colouringNodes,
    });
  },
  
  getExecutingActions(inputState) {
    const actions = [];
    
    if (inputState.mode == kModeColourNodes) {
      actions.push({
        eventType: kMouseDragMove,
        button: kButtonRight,
        blocking: true,
        name: 'Colour nodes',
        execute(event) {
          const {mouseX, initialHue, colouringNodes} = inputState.dataForMode(kModeColourNodes);
          const change = (mouse.x - mouseX) / 4;
          for (const node of colouringNodes) {
            node.hue = Math.round((initialHue + change) / 20) * 20;
            updateNodeDom(node);
          }
        },
      });

      actions.push({
        eventType: kMouseDragEnd,
        button: kButtonRight,
        blocking: true,
        name: 'Finish colouring nodes',
        execute(event) {
          inputState.clear();
        },
      });
    }
    
    return actions;
  }
};