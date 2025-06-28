const lastValues = [];
const pres = [];

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function main() {
  while (true) {
    let value = Math.round(Math.random() * 100);
    
    for (let i = 0; i < lastValues.length; ++i) {
      const lastValue = lastValues[i];
      lastValues[i] = value;
      pres[i].textContent += ' ' + value.toFixed(0);
      value -= lastValue;
    }

    lastValues.push(value);
    const pre = document.createElement('pre');
    pre.textContent = value;
    document.body.appendChild(pre);
    pres.push(pre);

    await sleep(500);
  }
}
main();