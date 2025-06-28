const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');

const twili = new Image();
twili.src = 'https://i.pinimg.com/originals/ff/46/dd/ff46dd1419cc16981b0c1ea1d5c6677c.png';

const wall = new Image();
wall.src = 'https://www.mapl.co.uk/wp-content/uploads/2013/03/iStock_000007449763XSmall.jpg';

const coin = new Image();
coin.src = 'https://auspost.com.au/shop/static/WFS/AusPost-Shop-Site/-/AusPost-Shop/en_AU/product/2050204INT-AusPost/1/resized_560x560.jpg';

const finish = new Image();
finish.src = 'https://image.shutterstock.com/image-vector/racing-flag-icon-260nw-348589541.jpg';

const size = 100;
async function main() {
  canvas.width = width;
  canvas.height = height;
  
  let twix = 0;
  let twiy = 0;
  function isIn({x, y}) {
    return !(twix + size < x || twix > x + size) && !(twiy + size < y || twiy > y + size);
  }
  let health = 100;
  let score = 0;
  let end = false;

  let walls = [];
  for (let i = 0; i < 50; ++i) {
    walls.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }

  let coins = [];
  for (let i = 0; i < 10; ++i) {
    coins.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  
  const finishx = width - size * 1.5;
  const finishy = height - size * 1.5;
  
  window.addEventListener('keydown', event => {
    if (end) {
      return;
    }
    console.log(event);
    const speed = 30;
    switch (event.code) {
      case 'ArrowUp':
        twiy -= speed;
        break;
      case 'ArrowDown':
        twiy += speed;
        break;
      case 'ArrowLeft':
        twix -= speed;
        break;
      case 'ArrowRight':
        twix += speed;
        break;
    }
    walls = walls.filter(wall => {
      if (isIn(wall)) {
        health -= 6;
        if (health <= 0) {
          end = true;
        }
        return false;
      }
      return true;
    });
    coins = coins.filter(coin => {
      if (isIn(coin)) {
        score += 23;
        return false;
      }
      return true;
    });
    if (isIn({x: finishx, y: finishy})) {
      end = true;
    }
  });
  
  while (true) {
    const time = await new Promise(requestAnimationFrame) / 1000;
    context.clearRect(0, 0, width, height);

    context.drawImage(twili, twix + 5*Math.cos(time), twiy + 4*Math.sin(time*1.1), size, size);
    context.font = '20px sans-serif';
    context.fillStyle = 'red';
    context.fillText(`Health: ${health}`, twix + size, twiy + 30);
    context.fillStyle = 'yellow';
    context.fillText(`scolre: ${score}`, twix + size, twiy + 60);
    
    if (end) {
      context.font = '50px serif';
      context.fillStyle = 'white';
      context.drawImage(twili, 0, 0, width, height);
      context.fillText(health > 0 ? 'YOU WIN' : 'DEAD', 0, height / 2);
      continue;
    }

    for (const {x, y} of walls) {
      context.drawImage(wall, x + 2*Math.cos(x + time * 3), y + 3*Math.sin(y + time), size, size);
    }
    context.globalCompositeOperation = 'multiply';
    for (const {x, y} of coins) {
      context.drawImage(coin, x, y + 10*Math.sin(time*4 + x), size, size);
    }
    context.globalCompositeOperation = 'source-over';
    context.save();
    context.translate(finishx, finishy);
    context.rotate(time * 10);
    context.drawImage(finish, -size / 2, - size / 2, size, size);
    context.restore();
  }
}
main();