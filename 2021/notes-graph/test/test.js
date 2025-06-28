const width = 1000;
const height = 1000;

function setup() {
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  document.body.appendChild(container);
  
  return {
    container,
  };
}

function tearDown({container}) {
  container.remove();
}

const tests = [
  function createNode({container}) {
    // Right click.
    // Check node created.
    // Check in edit mode.
  }
];

function main() {
  for (const test of tests) {
    const state = setup();
    test(state);
    tearDown(state);
  }
}

main();