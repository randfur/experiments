interface Animation {
  spriteMap: {[spriteId: SpriteId]: Sprite};
  lineBufferDataMap: {[lineBufferId: LineBufferId]: LineBufferData};
}

type SpriteId = string;

interface Sprite {
  id: SpriteId;
  framesPerSecond: number;
  fillStart: FillMode;
  fillEnd: FillMode;
  pixelSize: number;
  guideLayers: Array<Layer>;
  visibleLayers: Array<Layer>;
}

type FillMode = 'clamp' | 'hide' | 'repeat' | 'reverse-repeat';

interface Layer {
  animatedTransform: AnimatedTransform;
  keyframes: Array<Keyframe>;
}

interface Keyframe {
  frame: number;
  frames: number;
  group: GroupElement;
}

interface Element {
  type: string;
  animatiedTransform: AnimatedTransform;
}

interface GroupElement extends Element {
  type: 'group',
  pixelSize: number,
  opacity: number;
  children: Array<Element>;
}

interface LineBufferElement extends Element {
  type: 'lineBuffer',
  lineBufferId: LineBufferId;
}

interface SpriteElement extends Element {
  type: 'sprite',
  spriteId: SpriteId;
  outerFrame: number;
  innerFrame: number;
  timeScale: number;
  paused: boolean;
}

type AnimatedTransform = Transform | Array<TransformKeyframe>;

type Transform = TransformJson | null;

interface TransformJson {
  origin: Vec2;
  rotate: number;
  scale: Vec2;
  translate: Vec2;
}

interface Vec2 {
  x: number,
  y: number,
}

interface TransformKeyframe {
  frame: number;
  frames: number
  transform: Transform;
}

type LineBufferId = number;

// [(x, y, size, rgb)...]
type LineBufferData = Array<number>;
