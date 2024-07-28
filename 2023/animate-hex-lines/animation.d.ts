interface AnimationData {
  // Root sprite stored in ''.
  spriteMap: {[spriteId: SpriteId]: Sprite};
  lineBufferDataMap: {[lineBufferId: LineBufferId]: LineBufferData};
}

type SpriteId = string;

interface Sprite {
  id: SpriteId;
  guideLayers: Array<Layer>;
  visibleLayers: Array<Layer>;
}

interface Layer {
  animatedTransform: AnimatedTransform;
  keyframes: Array<Keyframe>;
}

interface Keyframe {
  startSeconds: number;
  durationSeconds: number;
  group: GroupElement;
}

interface Element {
  type: string;
  animatiedTransform: AnimatedTransform;
  opacity: number;
}

interface GroupElement extends Element {
  elements: Array<Element>;
}

interface LineBufferElement extends Element {
  lineBufferId: LineBufferId;
}

interface SpriteElement extends Element {
  spriteId: SpriteId;
  startSeconds: number;
  paused: boolean;
}

type AnimatedTransform = Transform | Array<TransformKeyframe>;

type Transform = TransformJson | null;

interface TransformJson {
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

interface TransformKeyframe {
  startSeconds: number;
  durationSeconds: number
  transform: Transform;
}

type LineBufferId = number;

// [(x, y, size, r, g, b)...]
type LineBufferData = Array<number>;
