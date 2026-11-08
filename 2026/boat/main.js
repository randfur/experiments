import {HexGame} from 'hex-game';
import {Vec3} from 'ga';

async function main() {
  HexGame.init({is3d: true});
  HexGame.entities.push(Boat, Water);
}

class Boat {
  static alive = true;
  static position = new Vec3(0, 0, 100);

  static draw(hexLines) {
    hexLines.addPoints([
      {position: this.position, size: 10, colour: {r: 255, g: 255, b: 255}},
      {position: Vec3.addXyz(this.position, 0, 10, 0), size: 10, colour: {r: 255, g: 255, b: 255}},
    ]);
  }
}

class Water {
  static alive = true;

  static draw(hexLines) {
  }
}

main();