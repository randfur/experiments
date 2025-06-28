import {MouseHandler} from '../ui/Mouse';
import {KeyHandler} from '../ui/Key';

export interface Tool extends MouseHandler {
  draw(): void;
}