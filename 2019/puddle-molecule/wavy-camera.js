import './vec3.js';

window.wavyCamera = {
  pos: new Vec3(),
  update(seconds) {
    const t = (1 - Math.cos(seconds / 4)) * 30;
    this.pos.x = t;
    this.pos.y = -5-t*10;
    this.pos.z = t;
  },
};
