export class TrigWalk {
  static update(time) {
    this.uniformData = new Float32Array([
      -0.1, -0.3 + 0.5 * Math.sin(time / 12000), -1.2 + 0.1 * Math.cos(time / 23100), -0.35,
      1 - 2 * Math.sin(time / 18000), 2, -3 + 8 * Math.cos(time / 8200), 4,
      -8, -2 + 3 * Math.cos(time / 7350), 7, 4 - 6 * Math.sin(time / 21000),
      0.3,
    ]);
  }

  static debugRender(context) {
    context.fillStyle = 'white';
    context.fillText(Array.from(this.uniformData).map(x => x.toFixed(1)).join(', '), 20, 30);
  }
}