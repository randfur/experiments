import './engine.js';
import './wavy-camera.js';
import './draggy-camera.js';

camera = wavyCamera;
window.addEventListener('mousedown', () => {
  if (camera !== wavyCamera)
    return;
  camera = draggyCamera;
  camera.pos.copy(wavyCamera.pos);
});