/*
interface Animation {
  spriteMap: {[SpriteId]: Sprite};
  lineBufferMap: {[LineBufferId]: LineBuffer};
}

type SpriteId = string;

interface Sprite {
  id: SpriteId;
  guideLayers: Array<Layer>;
  visibleLayers: Array<Layer>;
}

interface Layer {
  keyframes: Array<Keyframe>;
}

interface Keyframe {
  startSeconds: number;
  durationSeconds: number;
  group: GroupElement;
}

interface Element {
  type: string;
  transform: Transform | null;
  opacity: number;
}

interface GroupElement extends Element {
  type: 'group';
  elements: Array<Element>;
}

interface LineBufferElement extends Element {
  type: 'lineBuffer';
  lineBufferId: LineBufferId;
}

interface SpriteElement extends Element {
  type: 'sprite';
  spriteId: SpriteId;
  startSeconds: number;
  paused: boolean;
}

interface Transform {
  translate: {
    x: number,
    y: number,
  };
  scale: {
    x: number,
    y: number,
  }
  rotate: number;
}

type LineBufferId = number;

// [x, y, size, r, g, b]...
type LineBuffer = Array<number>;
*/
