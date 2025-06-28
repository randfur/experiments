import {debug, TAU, width, height, context} from './utils.js';

export class Tail {
  constructor() {
    this.points = [{
      x: width * 0.8,
      y: height / 2,
      dx: 0, dy: 0,
    }, {
      x: 0,
      y: Math.random() * height,
      dx: 0, dy: 0,
      targetDistance: 100,
      gravity: 2,
    }, {
      x: 0,
      y: Math.random() * height,
      dx: 0, dy: 0,
      targetDistance: 100,
      gravity: 3,
    }, {
      x: 0,
      y: Math.random() * height,
      dx: 0, dy: 0,
      targetDistance: 100,
      gravity: 1,
    }];
    this.timeOffset = Math.random() * TAU;
  }
  
  update(time) {
    for (let i = 1; i < this.points.length; ++i) {
      const point = this.points[i];
      const deltaX = this.points[i - 1].x - point.x;
      const deltaY = this.points[i - 1].y - point.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const force = -(point.targetDistance - distance) / distance;
      point.x += deltaX * force;
      point.y += deltaY * force;
      point.x -= 2;
      point.y += Math.sin(this.timeOffset - i + time / (1000 + i * 100)) * point.gravity;
    }
  }
  
  setPos({x, y}) {
    this.points[0].x = x;
    this.points[0].y = y;
  }
  
  end() {
    return this.points[3];
  }

  render() {
    context.fillStyle = '#f50';
    context.beginPath();
    const deltaX = this.points[1].x + this.points[3].x - 2 * this.points[0].x;
    const deltaY = this.points[1].y + this.points[3].y - 2 * this.points[0].y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const firstOffset = 100 / distance;
    const secondOffset = 10 / distance;
    context.moveTo(this.points[0].x, this.points[0].y);
    context.bezierCurveTo(
      this.points[1].x + deltaY * firstOffset, this.points[1].y - deltaX * firstOffset,
      this.points[2].x + deltaY * secondOffset, this.points[2].y - deltaX * secondOffset,
      this.points[3].x, this.points[3].y);
    context.bezierCurveTo(
      this.points[2].x - deltaY * secondOffset, this.points[2].y + deltaX * secondOffset,
      this.points[1].x - deltaY * firstOffset, this.points[1].y + deltaX * firstOffset,
      this.points[0].x, this.points[0].y);
    context.closePath();
    context.fill();

    if (debug) {
      context.fillStyle = 'black';
      context.beginPath();
      for (const point of this.points) {
        context.moveTo(point.x, point.y);
        context.arc(point.x, point.y, 5, 0, TAU);
      }
      context.fill();
    }
  }
}