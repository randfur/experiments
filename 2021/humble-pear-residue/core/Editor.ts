import {MouseHandler} from '../ui/Mouse';
import {KeyHandler} from '../ui/Key';

export interface Editor extends MouseHandler, KeyHandler {
  draw(): void;
}