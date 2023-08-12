export class Pool {
  constructor(create) {
    this.create = create;
    this.buffer = [];
    this.used = 0;
  }

  acquire() {
    if (this.used === this.buffer.length) {
      this.buffer.push(this.create());
    }
    return this.buffer[this.used++];
  }

  release(n) {
    this.used -= n;
  }

  releaseAll() {
    this.used = 0;
  }
}