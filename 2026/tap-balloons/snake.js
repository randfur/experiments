import {FlightSquad} from './flight-squad.js';

export class Snake {
  constructor(game) {
    this.alive = false;
    for (const entity of game.entities) {
      if (entity instanceof FlightSquad) {
        if (entity.aeroplanesRemaining === 0) {
          this.alive = true;
          break;
        }
      }
    }
  }

  update(time, timeDelta) {
    // TODO
  }

  draw(hexLines, textContext) {
    // TODO
  }
}
