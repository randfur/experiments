// TODO:
// Kill the main conductor loop when standing.
// Search the voices for a British accent.
// Find nice bell sounds.
// Avoid swaps that undo the previous swap (due to random selection).

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const conductorOutput = document.getElementById('conductorOutput');
const statusOutput = document.getElementById('statusOutput');

let audioContext = null;
let voice = null;
let audioReady = CreateResolvablePromise();

const targetOrders = {
  rounds: [1, 2, 3, 4, 5, 6],
  queens: [1, 3, 5, 2, 4, 6],
  kings: [5, 3, 1, 2, 4, 6],
  jokers: [1, 5, 4, 3, 2, 6],
  princes: [5, 3, 2, 1, 4, 6],
  burdette: [2, 1, 3, 5, 4, 6],
  subDominantMajorTriadSecondInversion: [5, 4, 2, 1, 3, 6],
};

let targetName = 'rounds';
let targetOrder = targetOrders[targetName];

let order = Array.from(targetOrder);
const bellCount = order.length;

let currentRound = {};
let handStrokeRound = true;
let stand = false;

let events = {
  nextHandStroke: CreateResolvablePromise(),
  nextBackStroke: CreateResolvablePromise(),
  stand: CreateResolvablePromise(),
};

async function main() {
  initCanvas();
  
  drawLoop();
  
  await userCommand('Go rounds and call changes.');
  await initAudio();
  await sleep(2000);
  ringLoop();

  (async () => {
    while (true) {
      await userCommand('Stand.');
      stand = true;
      await events.stand;
      await userCommand('Go again');
      stand = false;
      await sleep(1000);

      targetName = 'rounds';
      targetOrder = targetOrders[targetName];
      order = Array.from(targetOrder);

      ringLoop();
    }
  })();

  while (true) {
    const currentName = targetName;
    [targetName, targetOrder] = pickRandom(Array.from(Object.entries(targetOrders)));
    if (currentName === targetName) {
      continue;
    }
    
    while (!equalLists(order, targetOrder)) {
      await events.nextHandStroke;
      await stepTowardsTarget();
    }

    await sleep(1000);
    speak(`That's ${targetName}.`);
    for (const i of range(2)) {
      await events.nextHandStroke;
    }
  }
}

async function userCommand(command) {
  const button = document.createElement('button');
  button.textContent = command;
  document.body.appendChild(button);
  await new Promise(resolve => {
    button.addEventListener('click', resolve);
  });
  speak(command);
  button.remove();
}

function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}

async function speak(text) {
  conductorOutput.textContent = text + '\n' + conductorOutput.textContent;
  await audioReady;
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
  }
  speechSynthesis.speak(utterance);
}

function equalLists(listA, listB) {
  if (listA.length != listB.length) {
    return false;
  }
  for (const [i, value] of enumerate(listA)) {
    if (value !== listB[i]) {
      return false;
    }
  }
  return true;
}

function initCanvas() {
  canvas.width = (bellCount + 1) * 100;
  canvas.height = 500;
}

async function initAudio() {
  audioContext = new AudioContext();
  
  if (speechSynthesis.getVoices().length === 0) {
    await new Promise(resolve => {
      speechSynthesis.addEventListener('voiceschanged', resolve);
    });
  }

  voice = pickRandom(speechSynthesis.getVoices().filter(voice => {
    return voice.name.includes('United Kingdom') || voice.lang.includes('en-GB');
  }));
  console.log(voice);
  audioReady.resolve();
}

function pickRandom(list) {
  if (list.length === 0) {
    return null;
  }
  return list[Math.floor(Math.random() * list.length)];
}

async function stepTowardsTarget() {
  let choices = [];
  for (let [targetPlace, bell] of enumerate(targetOrder)) {
    const currentPlace = order.indexOf(bell);
    if (currentPlace !== targetPlace) {
      choices.push({
        currentPlace,
        targetPlace,
        delta: targetPlace - currentPlace,
      });
    }
  }

  if (choices.length === 0) {
    return;
  }
  
  choices.sort((a, b) => a.delta - b.delta);
  // const {currentPlace, targetPlace} = pickRandom(choices);
  const {currentPlace, targetPlace} = choices[0];
  const nextPlace = currentPlace + Math.sign(targetPlace - currentPlace);
  await swap(currentPlace, nextPlace);
}

async function swap(placeA, placeB) {
  const [frontPlace, backPlace] = placeA > placeB ? [placeB, placeA] : [placeA, placeB];
  speak(`${order[frontPlace]} to ${order[backPlace]}.`)
  await events.nextBackStroke;
  await events.nextHandStroke;
  [order[placeA], order[placeB]] = [order[placeB], order[placeA]];
}

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}

async function ringLoop() {
  const gapDuration = 400;
  while (!stand) {
    currentRound = {};
    handStrokeRound = true;
    await fireEvent('nextHandStroke');
    for (const bell of order) {
      currentRound[bell] = true;
      dingBell(bell);
      await sleep(gapDuration);
    }

    currentRound = {};
    handStrokeRound = false;
    await fireEvent('nextBackStroke');
    for (const bell of order) {
      currentRound[bell] = true;
      dingBell(bell);
      await sleep(gapDuration);
    }

    await sleep(gapDuration);
  }
  fireEvent('stand');
}

async function dingBell(bell) {
  const concertANote = 0;
  const concertAHz = 440;

  const bellMajorScalePosition = bellCount - bell;
  const majorScaleDeltas = [0, 2, 4, 5, 7, 9, 11];
  const bellNoteDelta = majorScaleDeltas[bellMajorScalePosition % majorScaleDeltas.length] + 12 * Math.floor(bellMajorScalePosition / majorScaleDeltas.length);
  
  const tonicGNote = concertANote - 12 - 1;
  const bellNote = tonicGNote + bellNoteDelta;
  
  const bellHz = concertAHz * (2 ** (bellNote / 12));
  
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(bellHz, audioContext.currentTime);
  oscillator.start();

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.001);
  gain.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  await sleep(2000);
  gain.disconnect();
  oscillator.disconnect();
}

function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

async function drawLoop() {
  while (true) {
    await new Promise(requestAnimationFrame);
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    const spacing = 100;
    for (let bell = 1; bell <= bellCount; ++bell) {
      const x = spacing * bell;
      
      context.fillStyle = 'black';
      context.font = '20px sans-serif';
      context.fillText(bell, x - 6, 35);
      
      context.lineWidth = 3;
      context.strokeStyle = 'grey';
      context.strokeRect(x, 50, 0, 400);

      const bellAtHandStroke = handStrokeRound === (currentRound[bell] ?? false);
      if (bellAtHandStroke) {
        context.fillStyle = 'blue';
        context.fillRect(x - 20, 150, 40, 200);
      }
    }

    statusOutput.textContent = `
Current order: ${order.join(' ')}
Target order: ${targetOrder.join(' ')} (${targetName})
`;
  }
}

function CreateResolvablePromise() {
  let resolve = null;
  const promise = new Promise(r => resolve = r);
  promise.resolve = resolve;
  return promise;
}

function fireEvent(eventName) {
  const event = events[eventName];
  events[eventName] = CreateResolvablePromise();
  event.resolve();
  return event;
}

main();