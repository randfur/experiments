import { Pen } from './pen';
import { Stamp } from './stamp';
import { Fill } from './fill';

export enum ToolType {
  Pen = 'pen',
  Stamp = 'stamp',
  Fill = 'fill',
}

export const tools = {
  [ToolType.Pen]: Pen,
  [ToolType.Stamp]: Stamp,
  [ToolType.Fill]: Fill,
};