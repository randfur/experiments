import { Dog } from './animals/dog';
import { Cat } from './animals/cat.js';
import { Mouse } from 'https://witty-legend-velociraptor.glitch.me/animals/mouse.js';
import {html, render} from 'https://unpkg.com/lit-html@1.3.0/lit-html.js';

render(html`
    TypeScript compile is working.
    ${[Dog, Cat, Mouse].map(Animal => new Animal().emoji())}
  `,
  document.getElementById('target')
);