async function loadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', event => resolve(image));
  });
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
  const airyus = await Promise.all([{
    src: 'airyu-look.png',
    x: 100,
  }, {
    src: 'airyu-shhhhh.png',
    x: -200,
  }].map(async ({src, x}) => {
    const image = await loadImage(src);
    image.style.transform = `translateX(${x}px)`;
    return image;
  }));
  
  let onScreen = document.getElementById('placeholder');

  let i = 0;
  while (true) {
    await sleep(800);
    const nextAiryu = airyus[(i++) % 2];
    onScreen.replaceWith(nextAiryu);
    onScreen = nextAiryu;
  }
}

main();