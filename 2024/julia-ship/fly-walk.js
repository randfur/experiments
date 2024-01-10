export class FlyWalk {
  static init() {
    this.prevFromPoint = new Vec4();
    this.fromPoint = new Vec4();
    this.toPoint = new Vec4(0, 1, 0, 0);
    this.nextToPoint = null;

    this.prevPoint = new Vec4();
    this.currentPoint = new Vec4();

    this.xDir = new Vec4(0, 0, 1, 0);
    this.yDir = new Vec4(0, 0, 0, 1);

    this.zoomSetting = 0;

    this.uniformData = null;
  }

  static update(time) {
    // Update position.
    // Get angle change from direction change.
    // Apply angle change to xyDir.
    // Project xyDir orthogonal to current direction.
    // Normalise xyDir.
  }

  static debugRender(context) {
  }
}