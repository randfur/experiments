const TAU = Math.PI * 2;

const unicodeSets = {
  arrows: [{ start: 10136, end: 10174 }, { start: 11008, end: 11012 }, { start: 11016, end: 11021 }, { start: 11085, end: 11087 }, { start: 11098, end: 11119 }, { start: 11136, end: 11192 }],
  angles: [{ start: 6656, end: 6678 }],
  bamum: [{ start: 92160, end: 92671 }],
  english: [{ start: 65, end: 90 }, { start: 97, end: 122 }],
  yiSyllables: [{start: 0xa000, end: 0xa48f}],
  blockyShapes: [{ start: 129792, end: 129951 }],
  hiragana: [{ start: 12353, end: 12438 }],
  shapes: [{ start: 9624, end: 9727 }],
  eyes: [{ start: 42600, end: 42606 }],
  braile: [{ start: 10240, end: 10495 }],
  cards: [{ start: 9824, end: 9831 }],
  chess: [{ start: 129536, end: 129619 }],
  chessBasic: [{ start: 9812, end: 9823 }],
  dice: [{ start: 9856, end: 9861 }],
  digits: [{ start: 130032, end: 130041 }],
  emoji: [{ start: 127744, end: 128591 }],
  figuresA: [{ start: 66000, end: 66047 }],
  figuresB: [{ start: 65664, end: 65775 }],
  circles: [{ start: 65817, end: 65843 }],
  fancy: [{ start: 8458, end: 8460 }, { start: 8464, end: 8467 }, { start: 8472, end: 8472 }, { start: 8475, end: 8476 }, { start: 8492, end: 8497 }],
  hieroglyphicsA: [{ start: 77824, end: 82943 }],
  hieroglyphicsB: [{ start: 82944, end: 83455 }],
  hieroglyphicsC: [{ start: 83456, end: 86015 }],
  lines: [{ start: 9776, end: 9783 }],
  music: [{ start: 119040, end: 119231 }],
  musicBasic: [{ start: 9833, end: 9839 }],
  nushu: [{ start: 110960, end: 111355 }],
  patterns: [{ start: 71114, end: 71127 }],
  snowflakes: [{ start: 10020, end: 10059 }],
  stickFigures: [{ start: 129989, end: 129993 }],
  swirlies: [{ start: 128592, end: 128615 }],
  shouldBeRemoved: [{ start: 0xffffe, end: 0xfffff }],
}
let unicodeSet = null;

const count = 200;
const items = [];
const boxSize = 512;
const font = '10px "Noto Sans", sans-serif';
const clickChangeRadius = Math.min(innerWidth, innerHeight) / 3;

let changeTimer = null;

async function main() {
  const canvas = document.createElement('canvas');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  
  await document.fonts.load(font);
  
  filterUnicodeSets();
  unicodeSet = location.hash.slice(1);
  if (!unicodeSets[unicodeSet]) {
    switchUnicodeSet();
  }
  window.addEventListener('click', async event => {
    switchUnicodeSet();
    resetChangeTimer();
    for (const item of items) {
      if (Math.sqrt((item.x + boxSize / 2 - event.offsetX) ** 2 + (item.y + boxSize / 2 - event.offsetY) ** 2) < clickChangeRadius) {
        item.unicode = randomUnicode();
        renderUnicode(item);
        await sleep(20);
      }
    }
  });
  resetChangeTimer();
  
  for (let i = 0; i < count; ++i) {
    const canvas = new OffscreenCanvas(boxSize, boxSize);
    const minScale = 2;
    const maxScale = 16;
    const scale = randomRange(minScale, maxScale);
    const item = {
      canvas,
      unicode: randomUnicode(),
      x: random(innerWidth) - boxSize / 2,
      y: -boxSize - innerHeight * random(2),
      dy: scale / 100,
      angle: random(TAU),
      scale,
      blur: 8 * ((scale - minScale) / (maxScale - minScale)) ** 2,
    };
    renderUnicode(item);
    items.push(item);
  }
  items.sort((a, b) => a.scale - b.scale);
  
  let lastTime = 0;
  while (true) {
    const newTime = await new Promise(requestAnimationFrame);
    const delta = Math.min(newTime - lastTime, 100);
    lastTime = newTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const item of items) {
      item.y += item.dy * delta;
      if (item.y > innerHeight + boxSize) {
        item.y = -random(innerHeight) - boxSize;
        item.unicode = randomUnicode();
        renderUnicode(item);
      }

      context.drawImage(item.canvas, item.x, item.y);
    }
  }
}

function renderUnicode({canvas, unicode, angle, scale, blur}) {
  const context = canvas.getContext('2d');
  context.filter = '';
  context.resetTransform();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2 - scale, canvas.height / 2);
  context.rotate(angle);
  context.scale(scale, scale);
  context.filter = `blur(${blur}px)`;
  context.fillStyle = '#bbb';
  context.font = font;
  context.fillText(unicode, 0, 10);
}

function random(x) {
  return Math.random() * x;
}

function randomRange(a, b) {
  return a + Math.random() * (b - a);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomUnicode() {
  const ranges = unicodeSets[unicodeSet];
  let sum = 0;
  for (const {start, end} of ranges) {
    sum += end - start + 1;
  }
  let pick = Math.ceil(random(sum));
  for (const {start, end} of ranges) {
    const width = end - start + 1;
    if (pick <= width) {
      return String.fromCodePoint(start + pick - 1);
    }
    pick -= width;
  }
}

function filterUnicodeSets() {
  const size = 32;
  
  const invalidCanvas = new OffscreenCanvas(size, size);
  const invalidContext = invalidCanvas.getContext('2d', {willReadFrequently: true});
  invalidContext.fillStyle = 'white';
  invalidContext.fillText(String.fromCodePoint(0xfffff), 0, size);
  const invalidImageData = invalidContext.getImageData(0, 0, size, size);
  
  const testCanvas = new OffscreenCanvas(size, size);
  const testContext = testCanvas.getContext('2d', {willReadFrequently: true});
  
  for (const unicodeSet of Object.keys(unicodeSets)) {
    testContext.clearRect(0, 0, size, size);
    testContext.fillStyle = 'white';
    testContext.fillText(String.fromCodePoint(unicodeSets[unicodeSet][0].start), 0, size);
    const testImageData = testContext.getImageData(0, 0, size, size);
    if (testImageData.data.every((value, index) => value === invalidImageData.data[index])) {
      console.log(`Removed ${unicodeSet}`);
      delete unicodeSets[unicodeSet];
    }
  }
}

function switchUnicodeSet() {
  unicodeSet = pickRandom(Object.keys(unicodeSets));
  location.hash = unicodeSet;
}

function resetChangeTimer() {
  clearInterval(changeTimer);
  changeTimer = setInterval(() => {
    switchUnicodeSet();
  }, 1 * 60 * 1000);
}

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

main();