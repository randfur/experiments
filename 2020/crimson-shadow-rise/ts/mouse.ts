export enum Button {
  Left,
  Middle,
  Right,
}

export interface MouseHandler {
  handleDown();
  handleMove();
  handleUp();
}

export class Mouse {
  static x: number = 0;
  static y: number = 0;

  static lastX: number = 0;
  static lastY: number = 0;
  
  static buttonDown: Button | null = null;
  
  static isDragging: boolean = false;
  static dragStartX: number = 0;
  static dragStartY: number = 0;

  static handlers: MouseHandler[];
  static registerHandler(handler: MouseHandler) {
    
  }
}

