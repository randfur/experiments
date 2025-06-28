window.Vec3 = class {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  copy({x, y, z}) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
};