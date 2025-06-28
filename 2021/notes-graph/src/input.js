export const kMouseDown = Symbol('MouseDown');
export const kMouseDragStart = Symbol('MouseDragStart');
export const kMouseDragMove = Symbol('MouseDragMove');
export const kMouseDragEnd = Symbol('MouseDragEnd');
export const kMouseClick = Symbol('MouseClick');
export const kMouseUp = Symbol('MouseUp');
export const kMouseNonDragMove = Symbol('MouseNonDragMove');
export const kMouseWheel = Symbol('MouseWheel');
export const kMouseContextMenu = Symbol('MouseContextMenu');

export const kButtonLeft = 0;
export const kButtonMiddle = 1;
export const kButtonRight = 2;

const kDragMinimumDistanceSquared = 3 ** 2;

export const mouse = {
  x: 0,
  y: 0,
  down: null,
  dragging: false,
};


class InputState {
  constructor() {
    this.clear();
  }
  
  setMode(mode, data) {
    this.mode = mode;
    this.data = data;
  }
  
  dataForMode(mode) {
    return this.mode === mode ? this.data : null;
  }
  
  clear() {
    this.mode = null;
    this.data = null;
  }
}

export function registerInputs({element, handlers, actionGenerators, onActionsUpdated}) {
  const inputState = new InputState();
  
  let actions = [];
  function updateActions() {
    const allActions = actionGenerators.flatMap(actionGenerator => actionGenerator(inputState));
    actions = [];
    for (const action of allActions) {
      if (action.button !== null && mouse.down && action.button !== mouse.down.button) {
        continue;
      }
      let found = false;
      for (const {blocking, eventType, button} of actions) {
        if (blocking && action.eventType === eventType && action.button === button) {
          found = true;
          break;
        }
      }
      if (!found) {
        actions.push(action);
      }
    }
    onActionsUpdated?.(inputState, actions);
  }
  updateActions();
  
  function handleEvent(eventType, event) {
    for (const handler of handlers) {
      handler(eventType, event);
    }

    for (const action of actions) {
      if (action.eventType === eventType
          && (action.button === null
              || (mouse.down
                  && action.button === mouse.down.button))) {
        action.execute(event);
      }
    }
    
    updateActions();
  }

  element.addEventListener('mousedown', event => {
    if (event.button == kButtonMiddle) {
      event.preventDefault();
    }
    if (mouse.down) {
      return;
    }
    updateMousePosition(event);
    mouse.down = {
      button: event.button,
      x: mouse.x,
      y: mouse.y,
    };
    handleEvent(kMouseDown, event);
  });

  element.addEventListener('mousemove', event => {
    if (mouse.down) {
      if (!mouse.dragging) {
        const dragDistanceSquared = (mouse.x - mouse.down.x) ** 2 + (mouse.y - mouse.down.y) ** 2;
        if (dragDistanceSquared >= kDragMinimumDistanceSquared) {
          mouse.dragging = true;
          handleEvent(kMouseDragStart, event);
        }
      }
    }
    updateMousePosition(event);
    handleEvent(mouse.dragging ? kMouseDragMove : kMouseNonDragMove, event);
  });

  element.addEventListener('mouseup', event => {
    if (!mouse.down || event.button !== mouse.down.button) {
      return;
    }
    updateMousePosition(event);
    handleEvent(kMouseUp, event);
    if (mouse.dragging) {
      mouse.dragging = false;
      handleEvent(kMouseDragEnd, event);
    } else {
      handleEvent(kMouseClick, event);
    }
    mouse.down = null;
    updateActions();
  });

  element.addEventListener('wheel', event => handleEvent(kMouseWheel, event));
  element.addEventListener('contextmenu', event => {
    let preventDefaultCalled = false;
    const originalPreventDefault = event.preventDefault;
    event.preventDefault = () => {
      preventDefaultCalled = true;
      originalPreventDefault.call(event);
    };

    handleEvent(kMouseContextMenu, event);
    
    // Context menus eat the mouse up event on Linux and Mac.
    // Clear mouse.down to avoid getting permanently stuck in the down state.
    if (!preventDefaultCalled) {
      mouse.down = null;
    }
  });
}

function updateMousePosition(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}
