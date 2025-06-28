import {Editor} from './Editor';

export class Editors {
  static stack: Editor[] = [];

  static getActive(): Editor | null {
    if (Editors.stack.length > 0) {
      return Editors.stack[Editors.stack.length - 1];
    }
    return null;
  }
}