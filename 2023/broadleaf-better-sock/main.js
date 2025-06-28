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
    src: 'https://cdn.glitch.com/f665a941-598d-41d2-a8c9-4333011ade41%2F6f0eabc6-ba27-43e6-a415-43796dc82d08.image.png?v=1603318910247',
    x: 100,
  }, {
    src: 'https://cdn.glitch.com/f665a941-598d-41d2-a8c9-4333011ade41%2F6a942bb0-0a84-4c2f-a60f-643d34c219fd.image.png?v=1603318914171',
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