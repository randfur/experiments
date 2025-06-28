function createRangeHandle(name) {
  const nameLabel = document.createElement('label');
  nameLabel.textContent = `${name}: `;
  const range = document.createElement('input');
  range.type = 'range';
  range.min = -10;
  range.max = 10;
  range.step = 0.01;
  range.value = 0;
  range.style.width = '90vw';
  const valueLabel = document.createElement('label');
  range.addEventListener('input', () => {
    valueLabel.textContent = range.value;
  });
  valueLabel.textContent = range.value;

  document.body.append(nameLabel);
  document.body.append(range);
  document.body.append(valueLabel);
  document.body.append(document.createElement('br'));
  
  return range;
}

function main() {
  document.body.append((() => {
    const element = document.createElement('div');
    element.textContent = 'Parameterised Fibonacci series'
    return element;
  })());
  
  const n0 = createRangeHandle('n[0]');
  const a = createRangeHandle('a');
  const b = createRangeHandle('b');
  const c = createRangeHandle('c');

  document.body.append((() => {
    const element = document.createElement('div');
    element.textContent = 'n[i] = a * n[i - 2] + b * n[i - 1] + c'
    return element;
  })());
  document.body.append(document.createElement('br'));
  
  for (const range of [n0, a, b, c]) {
    range.addEventListener('input', updateSequence);
  }
  
  const sequenceDisplay = document.createElement('div');
  sequenceDisplay.style.fontFamily = 'monospace';
  sequenceDisplay.style.fontSize = '20px';
  document.body.append(sequenceDisplay);
  function updateSequence() {
    const sequence = [Number(n0.value)];
    for (let i = 0; i < 5000; ++i) {
      sequence.push(
        (
          (sequence.length > 1 ? sequence[sequence.length - 2] * Number(a.value) : 0) +
          (sequence.length > 0 ? sequence[sequence.length - 1] * Number(b.value) : 0) +
          Number(c.value)
        ).toFixed(1)
      );
    }
    sequenceDisplay.textContent = sequence.join(' ');
  }
  updateSequence();
}

main();