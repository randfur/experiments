// TODO:
// - Ping graph.
// - Drag graph.
// - Wake lock.
// - Screensaving.
// - Sleep detection.
// - Time markers.

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  while (true) {
    await sleep(1);
    
  }
}

main();