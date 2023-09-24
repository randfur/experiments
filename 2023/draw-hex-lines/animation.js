export class Animation {
  constructor() {
    this.spriteMap = new Map();
    this.nextId = 0;
    this.rootSprite = this.addSprite();
  }

  addSprite() {
    const sprite = new Sprite(this.nextId);
    this.spriteMap.add(this.nextId, sprite);
    ++this.nextId;
    return sprite;
  }
}

export class Sprite {
  constructor(id) {
    this.id = id;
    this.layers = [new Layer()];
  }
}

export class Layer {
  constructor() {
    this.keyframes = [];
  }
}

export class Keyframe {
  constructor() {
    this.items = [];
  }
}

export class Drawing {
  constructor() {
    this.lines = [];
  }
}

export class SubSprite {
  constructor(id) {
    this.id = id;
    this.startFrame = 0;
    this.transform = new ArrayBuffer([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }
}