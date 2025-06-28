import { json, fromJson } from './json';

export class Position {
  @json() x: number;
  @json() y: number;
}

export class EventHandler {
  @json() script: string;
  compiled: Function;
  errors: string[];
}

export class EntityState {
  @json() spriteId: string;
  @json() soundId: string;
  @json(EventHandler) events: Map<EntityEvent, EventHandler>;
  @json(EventHandler) collisionEvents: Map<string, EventHandler>; // {room: RoomInstance, other: EntityInstance}
}

export class Entity {
  id: string;
  @json() noclip: boolean;
  @json() visible: boolean;
  @json() startingStateId: string;
  @json(EntityState) states: Map<string, EntityState>;
}

export class Frame {
  @json() resourceLocation: string;
  @json() emoji: string;
}

export class Sprite {
  @json(Frame) frames: Frame[];
  @json() frameRate: number;
  @json() width: number;
  @json() height: number;
}

export class Resource {
  @json() location: string;
  @json() sizeInBytes: number;
}

export class AudioResource extends Resource {
  @json() durationMs: number;
}

export class JsonResource extends Resource {}

export class ImageResource extends Resource {
  @json() width: number;
  @json() height: number;
}

export enum EntityEvent {
  create = "create", // {room: RoomInstance}
  update = "update", // {}
  mouseDown = "mouseDown", // {}
  outsideRoom = "outsideRoom", // {room: RoomInstance}
}

export class Resources {
  @json(AudioResource) audio: AudioResource[];
  @json(JsonResource) json: JsonResource[];
  @json(ImageResource) images: ImageResource[];
}

export class Portal {}

export class EntityBlueprint {
  @json() entityId: string;
  @json() position: Position;
}

export class RoomState {
  @json(EventHandler) events: Map<RoomEvent, EventHandler>;
  @json(EntityBlueprint) blueprints: EntityBlueprint[];
}

export class Room {
  @json() order: number;
  @json() viewportPosition: Position;
  @json() width: number;
  @json() height: number;
  @json() persist: boolean;
  @json() runningInBackground: boolean;
  @json(ImageResource) backgrounds: ImageResource[];
  @json(Portal) portals: Portal[];
  @json() startingStateId: string;
  @json(RoomState) states: Map<string, RoomState>;
}

export class Project {
  @json() startingRoomId: string;
  @json(Sprite) sprites: Map<string, Sprite>;
  @json(Entity) entities: Map<string, Entity>;
  @json() resources: Resources;
  @json(Room) rooms: Map<string, Room>;
}

export enum RoomEvent {
  create = "create", // {}
  update = "update", // {}
}

export const snek2: any = {
  "startingRoomId": "snakeroom",
  "resources": {
    "audio": [
      {
        "id": "boop",
        "location": "./assets/boop.ogg",
        "sizeInBytes": 20,
        "durationMs": 10
      }
    ],
    "json": [],
    "images": []
  },
  "sprites": {
      "snakehead-stationary": {
        "frames": [
          {
            "resourceLocation": "./assets/snakehead.png",
            "emoji": "🐍🍎SearchResults🍎SearchResults🍎SearchResults"
          }
        ],
        "frameRate": 60,
        "width": 32,
        "height": 32
      },
    "apple-stationary": {
      "frames": [
        {
          "resourceLocation": "./assets/apple.png",
          "emoji": "🍎SearchResults"
        }
      ],
      "frameRate": 60,
      "width": 32,
      "height": 32
    }
  },
  "rooms": {
    "snakeroom": {
      "order": 0,
      "width": 640,
      "height": 480,
      "viewportPosition": { x: 0, y: 0 },
      "persist": true,
      "runningInBackground": true,
      "backgrounds": [],
      "portals": [],
      "startingStateId": "initial",
      "states": {
        "initial": {
          "events": {
            "create": {
              "script": `
              `
            }
          },
          "blueprints": [
            {
              "entityId": "snake",
              "position": { x: 50, y: 50 }
            },
            {
              "entityId": "apple",
              "position": { x: 150, y: 150 }
            }
          ]
        }
      }
    }
  },
  "entities": {
    "snake": {
      "noclip": false,
      "visible": true,
      "startingStateId": "initial",
      "states": {
        "initial": {
          "spriteId": "snakehead-stationary",
          "soundId": "boop",
          "events": {
            "create": {
              "script": `
                this.direction = Math.random() * 7;
                this.speed = 8;
                this.position.x = room.model.width / 2;
                this.position.y = room.model.height / 2
              `
            },
            "update": {
              "script": `
                this.direction += Math.random() * 2 - 1;
                this.speed /= 1.1;
              `
            },
            "mouseDown": {
              "script": `
                if (wasHit) {
                  this.speed += 10;
                }
              `
            },
            "outsideRoom": {
              "script": `
                if (this.position.x > room.model.width-1) {
                  this.position.x = this.position.x - room.model.width
                } else if (this.position.x < 0) {
                  this.position.x = this.position.x + room.model.width
                }
                if (this.position.y > room.model.height-1) {
                  this.position.y = this.position.y - room.model.height
                } else if (this.position.y < 0) {
                  this.position.y = this.position.y + room.model.height
                }
              `
            }
          },
          "collisionEvents": {
            "apple": {
              "script": `
                this.scale *= 1.1
              `
            }
          }
        }
      }
    },
    "apple": {
      "noclip": false,
      "visible": true,
      "startingStateId": "initial",
      "states": {
        "initial": {
          "spriteId": "apple-stationary",
          "soundId": "boop",
          "events": {
            "create": {
              "script": `
                this.direction = 5;
                this.position.x = Math.random() * room.model.width;
                this.position.y = Math.random() * room.model.height;
              `
            },
            "mouseDown": {
              "script": `
                if (wasHit) {
                  this.speed += 10;
                }
              `
            },
            "outsideRoom": {
              "script": `
                this.position.x = this.position.x > room.model.width ? 0 + (this.position.x - room.model.width) : room.model.width - this.position.x;
                this.position.y = this.position.y > room.model.height ? 0 + (this.position.y - room.model.height) : room.model.height - this.position.y;
              `
            }
          },
          "collisionEvents": {
            "snake": {
              "script": `
                this.position.x = Math.random() * room.model.width;
                this.position.y = Math.random() * room.model.height;
              `
            }
          }
        }
      }
    }
  }
};