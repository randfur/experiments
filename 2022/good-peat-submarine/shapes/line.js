import {Vec3} from  '../utils/vec3.js';

export class Line {
  constructor() {
    this.start = new Vec3();
    this.end = new Vec3();
    this.lineWidth = 2;
    this.colour = 'white';
    this.addOnePixel = false;
  }

  applyCameraTransform(camera) {
    camera.inplaceTransform(this.start);
    camera.inplaceTransform(this.end);
  }

  getCullingZ() {
    return Math.max(this.start.z, this.end.z);
  }

  getSortingZ() {
    return (this.start.z + this.end.z) / 2;
  }

  draw(context3d) {
    const zNear = context3d.camera.zNear;
    const nearPosition = this.start.z < this.end.z ? this.start : this.end;
    const farPosition = this.start.z < this.end.z ? this.end : this.start;
    if (farPosition.z <= zNear) {
      return;
    }
    if (nearPosition.z < zNear) {
      const midPosition = Vec3.pool.acquire();
      const nearDistance = zNear - nearPosition.z;
      const farDistance = farPosition.z - nearPosition.z;
      midPosition.lerpBetween(nearPosition, farPosition, nearDistance / farDistance);
      nearPosition.copy(midPosition);
      Vec3.pool.release(1);
    }

   const [
      screenStartX,
      screenStartY,
      screenLineWidth,
    ] = context3d.boxToScreenBox(nearPosition, this.lineWidth);
    let [
      screenEndX,
      screenEndY,
    ] = context3d.boxToScreenBox(farPosition);
    
    if (this.addOnePixel) {
      const xDiff = screenEndX - screenStartX;
      const yDiff = screenEndY - screenStartY;
      const length = Math.sqrt(xDiff ** 2 + yDiff ** 2);
      screenEndX += xDiff / length;
      screenEndY += yDiff / length;
    }
    
    context3d.setStrokeColour(this.colour);
    context3d.setLineWidth(screenLineWidth);
    context3d.context2d.beginPath();
    context3d.context2d.moveTo(screenStartX, screenStartY);
    context3d.context2d.lineTo(screenEndX, screenEndY);
    context3d.context2d.stroke()
  }
}  