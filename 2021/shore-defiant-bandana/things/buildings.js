import {width, context} from '../engine/canvas.js';
import {drawAll} from '../engine/utils.js';
import {Ground} from './ground.js';

class Building {
  constructor(x) {
    this.x = x;
    this.width = 20 + Math.random() * 60;
    this.height = 20 + Math.random() * (100 + this.width * 2);
  }
  
  draw() {
    context.fillStyle = 'black';
    context.fillRect(this.x - this.width / 2, Ground.y - this.height, this.width, this.height);
  }
}

export class Buildings {
  static list = [];
  
  static init() {
    let x = 0;
    while (x < width) {
      const building = new Building(x);
      Buildings.list.push(building);
      x += building.width / 2;
    }
    // let lastBuilding = null;
    // for (let i = 0; i < Buildings.count; ++i) {
    //   const x = i / Buildings.count * width;
    //   const overlap = lastBuilding && lastBuilding.x + lastBuilding.width / 2 > x;
    //   lastBuilding = new Building(x, overlap ? 250 : 100);
    //   Buildings.list.push(lastBuilding);
    // }
  }
  
  static draw() {
    drawAll(Buildings.list);
  }
}