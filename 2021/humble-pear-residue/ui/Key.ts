export enum KeyEventType {
  Down,
  Up,
}

export interface KeyHandler {
  handleKey(type: KeyEventType, code: string): boolean;
}

export class Key {
  static init(handler: KeyHandler) {
    window.addEventListener('keydown', ({code}) => handler.handleKey(KeyEventType.Down, code));
    window.addEventListener('keyup', ({code}) => handler.handleKey(KeyEventType.Up, code));
  }
}