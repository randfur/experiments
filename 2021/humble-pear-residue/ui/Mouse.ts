export enum MouseEventType {
  Move,
  Click,
  Down,
  DragStart,
  DragMove,
  DragEnd,
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export interface MouseHandler {
  handleMouse(type: MouseEventType, button: MouseButton | null): boolean;
}

const MouseButtons = Object.values(MouseButton) as MouseButton[];

export class Mouse {
  static x = 0;
  static y = 0;
  static isDown = Object.fromEntries(MouseButtons.map(button => [button, false]));
  static isDragging = Object.fromEntries(MouseButtons.map(button => [button, false]));
  static dragStart = Object.fromEntries(MouseButtons.map(button => [button, {x: 0, y: 0}]));
  static dragPrevious = Object.fromEntries(MouseButtons.map(button => [button, {x: 0, y: 0}]));
  
  static handler?: MouseHandler;
  
  static init(handler: MouseHandler) {
    Mouse.handler = handler;

    window.addEventListener('mousedown', event => {
      const button = event.button;
      Mouse.isDown[button] = true;
      Mouse.x = event.clientX;
      Mouse.y = event.clientY;
      handler.handleMouse(MouseEventType.Down, button);
    });

    window.addEventListener('mousemove', event => {
      const {x: lastX, y: lastY} = Mouse;
      Mouse.x = event.clientX;
      Mouse.y = event.clientY;
      handler.handleMouse(MouseEventType.Move, null);
      for (const button of MouseButtons) {
        if (Mouse.isDragging[button]) {
          Mouse.dragPrevious[button].x = lastX;
          Mouse.dragPrevious[button].y = lastY;
          handler.handleMouse(MouseEventType.DragMove, button);
        } else if (Mouse.isDown[button]) {
          Mouse.isDragging[button] = true;
          Mouse.dragStart[button].x = lastX;
          Mouse.dragStart[button].y = lastY;
          Mouse.dragPrevious[button].x = lastX;
          Mouse.dragPrevious[button].y = lastY;
          handler.handleMouse(MouseEventType.DragStart, button);
        }
      }
    });
    
    window.addEventListener('mouseup', event => {
      const button = event.button;
      const wasDragging = Mouse.isDragging[button];
      Mouse.isDown[button] = false;
      Mouse.isDragging[button] = false;
      if (wasDragging) {
        handler.handleMouse(MouseEventType.DragEnd, button);
      } else {
        handler.handleMouse(MouseEventType.Click, button);
      }
    });
    
    window.addEventListener('contextmenu', event => event.preventDefault());
  }
}