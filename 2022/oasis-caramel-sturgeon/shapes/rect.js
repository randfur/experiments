import {Vec3} from  '../vec3.js';

export class Rect {
  constructor() {
    this.position = new Vec3();
    this.size = 
    this.colour = 'white';
  }

  applyCameraTransform(camera) {
    camera.transform(this.position);
  }

  getZ() {
    return this.position.z;
  }

  draw(context3d) {
    const [
      screenX,
      screenY,
      screenWidth,
      screenHeight,
    ] = context3d.boxToScreenBox(this.position, this.width, this.height);
    context3d.setFillColour(this.colour);
    context3d.context2d.fillRect(
      screenX - screenWidth / 2,
      screenY - screenHeight / 2,
      screenWidth,
      screenHeight,
    );
  }
}