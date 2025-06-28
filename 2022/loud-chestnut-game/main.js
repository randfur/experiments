const imageSize = 128;

function nextFrame() {
  return new Promise(requestAnimationFrame);
}

async function main() {
  const canvas = document.getElementById('canvas');
  const scale = 8;
  canvas.style.transform = `scale(${scale})`;
  canvas.width = innerWidth / scale;
  canvas.height = innerHeight / scale;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;

  let rotate = true;
  
  const music = new Audio('https://pokyfriends.com/sugar-rush/jazz.mp3');
  document.getElementById('speaker').addEventListener('click', event => {
    music.paused ? music.play() : music.pause();
    event.stopPropagation();
  });

  const image = new Image();
  let n = 0;
  function setImageSrc() {
    image.src = `https://pokyfriends.com/sugar-rush/Dos${(n % 4) + 1}.png`;
    ++n;
  }
  setImageSrc();
  window.addEventListener('click', setImageSrc);
  window.addEventListener('keypress', event => {
    if (event.key == 'r')
      rotate ^= true;
    else
      setImageSrc();
  });

  let lastSquish = 0;
  while (true) {
    const time = await nextFrame();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    const squish = Math.cos(time / 1500);
    if (Math.sign(squish) != Math.sign(lastSquish))
      setImageSrc();
    lastSquish = squish;
    context.scale(squish, 1);
    if (rotate)
      context.rotate(time / 1110);
    context.drawImage(image, -imageSize / 2, -imageSize / 2);
    context.restore();
  }
}
main();