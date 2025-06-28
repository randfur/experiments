const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');
const audioContext = new AudioContext();

function getClick() {
  return new Promise(resolve => {
    const button = document.createElement('button');
    button.textContent = 'press';
    button.addEventListener('click', event => {
      button.remove();
      resolve();
    });
    document.body.appendChild(button);
    button.focus();
  });
}

const MidiCommands = {
  NoteOn: 144,
  TimingClock: 248,
  ActiveSensing: 254,
};

const roots = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

const keyboardPiano = {
  order: [
    'KeyA',
    'KeyW',
    'KeyS',
    'KeyE',
    'KeyD',
    'KeyF',
    'KeyT',
    'KeyG',
    'KeyY',
    'KeyH',
    'KeyU',
    'KeyJ',
    'KeyK',
    'KeyO',
    'KeyL',
    'KeyP',
    'Semicolon',
    'Quote',
    'BracketRight',
  ],
  pitchStart: 12 * 4,
  velocity: 70,
};

function pitchToRoot(pitch) {
  return roots[pitch % 12];
}

const noteWidth = 10;
const heightPerMillisecond = 2 / 10;
function drawNotes(noteHistory, time) {
  for (const {pitch, startTime, endTime} of noteHistory) {
    context.fillRect(
      pitch * noteWidth,
      (endTime ? time - endTime : 0) * heightPerMillisecond,
      noteWidth,
      (endTime ? endTime - startTime : time - startTime) * heightPerMillisecond,
    );
  }
}

async function onNote(handler) {
  const midiAccess = await navigator.requestMIDIAccess();
  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', event => {
      const [command, pitch, velocity] = event.data;
      if (command == MidiCommands.NoteOn) {
        handler({pitch, velocity});
      }
    });
  }
  for (const eventName of ['keydown', 'keyup']) {
    window.addEventListener(eventName, event => {
      const pitchIndex = keyboardPiano.order.indexOf(event.code);
      if (pitchIndex != -1) {
        handler({
          pitch: keyboardPiano.pitchStart + pitchIndex,
          velocity: eventName == 'keydown' ? keyboardPiano.velocity : 0,
        });
      }
    });
  }
}

async function main() {
  await getClick();

  canvas.width = width;
  canvas.height = height;
  
  let notes = {
    active: {},
    history: [],
  };
  
  onNote(({pitch, velocity}) => {
    let activeNote = notes.active[pitch];
    if (!activeNote) {
      activeNote = notes.active[pitch] = {
        pitch,
        velocity: 0,
        oscillator: audioContext.createOscillator(),
        gain: audioContext.createGain(),
        historyEntry: null,
      };
      // activeNote.oscillator.connect(activeNote.gain);
      // activeNote.gain.connect(audioContext.destination);
    }
    const on = velocity > 0;
    if (on && !activeNote.historyEntry) {
      activeNote.historyEntry = {
        pitch,
        startTime: performance.now(),
        endTime: null,
      };
      notes.history.push(activeNote.historyEntry);
    }
    if (!on && activeNote.historyEntry) {
      activeNote.historyEntry.endTime = performance.now();
      activeNote.historyEntry = null;
    }
  });
  
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    context.clearRect(0, 0, width, height);
    drawNotes(notes.history, time);
    notes.history = notes.history.filter(({endTime}) => !endTime || ((time - endTime) * heightPerMillisecond < height));
  }
}
main();