let canvas = null;
let context = null;
let width = null;
let height = null;

let drawCanvas = null;
let zoom = 8;

async function main() {
  playWithFiles();
  initCanvas();
  
  context.scale(zoom, zoom);
  context.drawImage(drawCanvas, 0, 0);
}

function initCanvas() {
  width = 600;
  height = 600;
  canvas = createElement('canvas', {parent: document.body});
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  
  drawCanvas = new OffscreenCanvas(32, 32);
}

async function playWithFiles() {  const dir = await getDir();
  const dog = await dir.getFileHandle('dog.txt', {create: true});
  const stream = await dog.createWritable();
  stream.write('i am a dog');
  stream.close();
}

async function getDir() {
  const button = createElement('button', {
    parent: document.body,
    text: 'Select directory',
  });
  await new Promise(resolve => {
    button.addEventListener('click', resolve);
  });
  const dir = await showDirectoryPicker({mode: 'readwrite'});
  button.remove();
  return dir;
}

function createElement(tagName, {
    parent,
    text,
  }) {
  const element = document.createElement(tagName);
  if (parent) {
    parent.appendChild(element);
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

main();