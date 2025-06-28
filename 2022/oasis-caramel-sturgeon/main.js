import {Rect} from './shapes/rect.js';
import {Context3d} from './context-3d.js';
import {Vec3} from './vec3.js';

const TAU = Math.PI * 2;
const width = window.innerWidth;
const height = window.innerHeight;
const depth = 10 * Math.max(width, height);
const zZoom = 400;
const zNearClip = 0.01;



async function main() {
  canvas.width = width;
  canvas.height = height;
  const camera = {
    position: new Vec3(),
    transform(position) {
      position.z -= this.position.z;
    },
    zNear: 0,
  };
  const context3d = new Context3d(canvas, camera);
  
  while (true) {
    await new Promise(requestAnimationFrame);
    
    
    const rectCount = 3990;
    const zSpacing = 5;
    for (let i = 0; i < rectCount; ++i) {
      const x = Math.cos(i**1.001) * 100;
      const y = Math.sin(i) * 100;
      const z = i * zSpacing;
      const rect = context3d.add(Rect);
      rect.position.set(x, y, z);
      rect.colour = 'yellow';
      rect.width = 4;
      rect.height = 4;
    }
    
    camera.position.z += 10;
    if (camera.position.z > rectCount * zSpacing) {
      camera.position.z = 0;
    }
    
    context3d.processQueue();
  }
}

main();