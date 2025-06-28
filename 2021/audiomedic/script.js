let ac = new AudioContext({sampleRate: 48000});
let TAU  = 2*Math.PI;


navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    for (var input of midiAccess.inputs.values())
        input.onmidimessage = getMIDIMessage;
    
}

function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
    let src = null
    switch (command) {
        case 158: // noteOn
            if (velocity > 0) {
                src = noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 142: // noteOff
            noteOff(src);
            break;
        // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
    }
}

export function noteToHertz(note) {
  // 69 will be reference
  let localisedNote = note - 69;
  return (2**(localisedNote/12) * 440)
  
}

function getNoteSamples(hz) {
  return (1/hz) * ac.sampleRate;
}

function getWave(time, hz) {
  return Math.sin(((TAU/getNoteSamples(hz))*time))
}


function noteOn(note, velocity) {
  let buffer = ac.createBuffer(
  1, // Number of channels 1 mono 2 stereo 6
  ac.sampleRate * 10, // Complete number of samples
  ac.sampleRate // sample rate
  )
  let channelData = buffer.getChannelData(0)
  let hertz = noteToHertz(note)
  console.log(hertz)
  for (let i = 0; i < buffer.length; ++i) {  
    channelData[i] = getWave(i, noteToHertz(note))
  }
  // Buffer Source needed to play the channel data
  let src = ac.createBufferSource();
  src.buffer = buffer;
  // Gain controller for volume
  let gainCtrl = ac.createGain();
  // Set value of gain node at a specific time 
  gainCtrl.gain.setValueAtTime(0.2, 0);

  // Connect all the bits
  src.connect(gainCtrl)
  gainCtrl.connect(ac.destination) 
  src.start()
  return src
}


function noteOff(src) {
  if (src) 
    src.stop()
  
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}



// // Sample Rate is double what humans can hear 48000 
// console.log(ac)


// let buffer = ac.createBuffer(
//   1, // Number of channels 1 mono 2 stereo 6
//   ac.sampleRate * 10, // Complete number of samples
//   ac.sampleRate // sample rate
// )


// let channelData = buffer.getChannelData(0)

// console.log(channelData.length)


// // Randomly assign a value to the channel data 
// // in order to create 1 second of white noise
// // Let's get a pure A sound 440 Hz (Frequency)
// let x = Math.random() * 500
// let y = Math.random() * 500
// let z = Math.random() * 500
// for (let i = 0; i < buffer.length; ++i) {  
//   // sin(tau/aNotePerSample *i)
//   // we need to
//   //channelData[i] = getWave(i, x)  + getWave(i, y) + getWave(i, z) + getWave(i, 300 / (1+i/(ac.sampleRate*10)));
//   // channelData[i] = getWave(i, 440) + getWave(i, (2**(7/12))*440);3
//   channelData[i] = getWave(i, 440)
// }

// // Buffer Source needed to play the channel data
// let src = ac.createBufferSource();
// src.buffer = buffer;

// // Gain controller for volume
// let gainCtrl = ac.createGain();
// // Set value of gain node at a specific time 
// gainCtrl.gain.setValueAtTime(0.2, 0);

// // Connect all the bits
// src.connect(gainCtrl)
// gainCtrl.connect(ac.destination) 


// let button = document.getElementById('button')
// let dog = true;
// let clickTime = null;
// button.addEventListener('click', () => {
//   console.log("I am clicked");
//   console.log(src);
//   if (dog) {
//     src.start();
//     clickTime = performance.now();
//   } else {
//     src.stop();
//   }
//   dog = !dog;
// });

// async function main() {
//   let canvas = document.getElementById('canvas')
//   let context = canvas.getContext('2d');
//   canvas.width = innerWidth;
//   canvas.height = innerHeight;
//   context.fillStyle = '#efd8';
//   while (true) {
//     const time = await new Promise(requestAnimationFrame);
//     const playDuration = clickTime ? time - clickTime : 0;
//     const startI = Math.floor(playDuration * ac.sampleRate / 1000);
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     for (let i = startI; i < Math.min(startI+canvas.width, channelData.length); ++i) {
//       context.fillRect(i-startI, canvas.height / 2, 1, channelData[i] * 100);
//     }
//   }
// }
// main()

