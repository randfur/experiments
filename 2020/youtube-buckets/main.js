import {html, render} from 'https://unpkg.com/lit-html?module';
import {youtubeBuckets} from './ui/youtube-buckets.js';
import {Controller} from './controller.js';
import {recordedData} from './test-data.js';
import {YouTube} from './youtube.js';

let scheduled = false;
export function rerender() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(_ => {
      render(youtubeBuckets(), document.getElementById('app'));
      scheduled = false;
    });
  }
}

function main() {
  YouTube.useRecordedData(recordedData);
  Controller.init();
}
main();