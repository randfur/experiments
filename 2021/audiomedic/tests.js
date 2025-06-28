// See https://pages.mtu.edu/~suits/notefreqs.html


import { noteToHertz } from './script.js';

// Frequency: 523.25
function testNoteToHertz() {
  // Midi No: 72
  
  let c5hertz = noteToHertz(72);
  console.assert(c5hertz > 523.25 && c5hertz < 523.26);
  
  // Midi Note: 67
  let g4hertz = noteToHertz(67)
  console.assert(g4hertz > 391.95 && g4hertz < 393.00);
}

testNoteToHertz() 