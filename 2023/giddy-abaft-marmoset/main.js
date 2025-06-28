import {Game} from 'async-game-engine/engine/game.js';
import {BasicEntity} from 'async-game-engine/presets/basic-entity.js';
import {BasicScene} from 'async-game-engine/presets/basic-scene.js';
import {TAU, lerp, distance} from 'async-game-engine/utils/math.js';
import {deviate} from 'async-game-engine/utils/random.js';

async function main() {
  new Game({
    drawing: {
      clearFrames: true,
      viewScale: 4,
    },
    initialScene: class extends BasicScene {
      async run() {
        this.create(VoxelSpace);
        await this.forever();
      }
    },
  });
}

class VoxelSpace extends BasicEntity {
  init() {
    const mapSize = 1024;
    this.mapSize = mapSize;
    this.heightMap = new Float32Array(mapSize * mapSize);

    // Set height map values.
    for (let x = 0; x < mapSize; ++x) {
      for (let y = 0; y < mapSize; ++y) {
        // this.heightMap[x + mapSize * y] = Math.random() * 10;
        this.heightMap[x + mapSize * y] = Math.abs(
          Math.cos(x / 10 + Math.sin((y + 40) / 20) * 6) * 50 +
          Math.sin(y / 4 + Math.sin(x / 100) * 10) * 50
        ) / 8;
      }
    }

    this.camera = {
      x: mapSize / 2,
      y: mapSize,
      fovAngle: 120 * TAU / 360,
      drawDistance: 100,
      height: 30,
    };
    // TODO variable camera direction.
  }

  async run() {
    while (true) {
      this.camera.x += 0.1;
      this.camera.y -= 1;
      this.camera.height += 0.0;
      // this.camera.fovAngle += 0.1 * TAU / 360;
      await this.tick();
    }
  }
  
  readHeightMap(x, y) {
    const a = this.readClampedHeightMap(x, y);
    const b = this.readClampedHeightMap(x + 1, y);
    const c = this.readClampedHeightMap(x, y + 1);
    const d = this.readClampedHeightMap(x + 1, y + 1);
    x = x - Math.floor(x);
    y = y - Math.floor(y);
    const e = lerp(a, c, y);
    const f = lerp(b, d, y);
    return lerp(e, f, x);
  }

  readClampedHeightMap(x, y) {
    x = Math.max(0, Math.min(this.mapSize - 1, Math.floor(x)));
    y = Math.max(0, Math.min(this.mapSize - 1, Math.floor(y)));
    return this.heightMap[x + this.mapSize * y];
  }

  onDraw(context, width, height) {
    // // Temporary: Render height map in 2D.
    // for (let x = 0; x < mapSize; ++x) {
    //   for (let y = 0; y < mapSize; ++y) {
    //     const height = heightMap[x + mapSize * y];
    //     context.fillStyle = `hsl(0deg, 0%, ${height}%)`;
    //     context.fillRect(x, y, 1, 1);
    //   }
    // }
    
    const {fovAngle, drawDistance} = this.camera;
    
    const triangleHalfWidth = drawDistance / Math.tan(TAU / 4 - fovAngle / 2);
    // context.strokeStyle = 'blue';
    // context.beginPath();
    // context.moveTo(this.camera.x, this.camera.y);
    // context.lineTo(this.camera.x - triangleHalfWidth, this.camera.y - drawDistance);
    // context.lineTo(this.camera.x + triangleHalfWidth, this.camera.y - drawDistance);
    // context.closePath();
    // context.stroke();
    
    for (let currentDrawDistance = drawDistance; currentDrawDistance >= 0; --currentDrawDistance) {
      const y = this.camera.y - currentDrawDistance;
      const xStart = this.camera.x - triangleHalfWidth * currentDrawDistance / drawDistance;
      const xEnd = this.camera.x + triangleHalfWidth * currentDrawDistance / drawDistance;
      for (let x = xStart; x <= xEnd; ++x) {
        // const height = this.readClampedHeightMap(x, y);
        const height = this.readHeightMap(x, y);

        const xDiff = x - this.camera.x;
        const yDiff = y - this.camera.y;
        const hDiff = height - this.camera.height;
        const zDiv = -yDiff / 50;
        
        const spotlightSdf = distance(xDiff, yDiff) - 40;

        context.fillStyle = `hsl(90deg, ${spotlightSdf}%, ${10 * height * (1 - currentDrawDistance / drawDistance)}%)`;

        // // Debugging: Draw height map in 2D.
        context.fillRect(x, y, 1, 1);
        
        // Draw 3D terrain.
        context.fillRect(
            width / 2 + xDiff / zDiv,
            height / 2 - hDiff / zDiv,
            1, 10);
        
      }
      // break;
    }
    // iterate over triangle.
    // draw columns for each point.
    // Extras:
    // Depth buffer.
  }
}

main();