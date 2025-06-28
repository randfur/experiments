import {Model} from './model.js';

export function injectStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

export const presetColors = [
  '#f00',
  '#f70',
  '#ff0',
  '#7f0',
  '#0f0',
  '#0ee',
  '#07f',
  '#44f',
  '#70f',
  '#fff',
  '#777',
];

export function createDefaultBucket() {
  return {
    name: 'Untitled',
    color: presetColors[0],
    channelIds: [],
  };
}

export function enterIsClick(event) {
  if (event.key == 'Enter') {
    event.target.click();
  }
}

export const isTouchScreen = 'ontouchstart' in document.documentElement;

export function getActiveBucket() {
  if (Model.session.state.type != 'active') {
    return null;
  }
  return Model.stored.buckets.find(bucket => bucket.name == Model.session.state.activeBucketName);
}

export function getBucketChannels(bucket) {
  return bucket.channelIds.map(id => Model.downloaded.channels[id]);
}

export function parseIso8601InSeconds(iso8601) {
  let result = 0;
  for (let match of iso8601.matchAll(/(\d+)(\w)/g)) {
    result += parseInt(match[1]) * {
      S: 1,
      M: 60,
      H: 60 * 60,
      D: 60 * 60 * 24,
    }[match[2]];
  }
  return result;
}