import {html, directive} from 'https://unpkg.com/lit-html?module';
import {classMap} from 'https://unpkg.com/lit-html/directives/class-map?module';
import {injectStyle, getActiveBucket, getBucketChannels, presetColors, enterIsClick, isTouchScreen} from '../utils.js'
import {Controller} from '../controller.js';
import {Model} from '../model.js';

export function bucketEditor() {
  const activeBucket = getActiveBucket();
  if (!activeBucket) {
    return html`No active bucket`;
  }

  const channelsInActiveSet = new Set(getBucketChannels(activeBucket));
  const channelsInActive = Array.from(channelsInActiveSet).sort(compareChannels);

  const channelsInAnySet = new Set(Model.stored.buckets.flatMap(bucket => getBucketChannels(bucket)));
  const channelsInAny = Array.from(channelsInAnySet).sort(compareChannels);

  const channelsInNone = Object.values(Model.downloaded.channels).filter(channel => !channelsInAnySet.has(channel)).sort(compareChannels);

  const channelsInOthers = Array.from(channelsInAnySet).filter(channel => !channelsInActiveSet.has(channel)).sort(compareChannels);

  const channelBucketsMap = new Map();
  for (const bucket of Model.stored.buckets) {
    for (const channel of getBucketChannels(bucket)) {
      if (!channelBucketsMap.has(channel)) {
        channelBucketsMap.set(channel, []);
      }
      channelBucketsMap.get(channel).push(bucket);
    }
  }

  function renderChannel(channel) {
    const inActiveBucket = channelsInActiveSet.has(channel);
    const buckets = channelBucketsMap.get(channel);
    const classes = classMap({
      'channel-bar': true,
      'channel-bar-to-add': !inActiveBucket,
    });
    return html`
      <div
          class="${classes}"
          .channel="${channel}"
          @click="${!inActiveBucket ? addChannel : null}"
          @keypress="${enterIsClick}"
          tabIndex="${!inActiveBucket ? 0 : -1}">
        <a href="${channel.url}" target="_blank" @click="${stopPropagation}"><img class="channel-bar-icon" src="${channel.iconUrl}"></a>
        <div class="channel-bar-text">
          ${channel.name}
          ${buckets
            ? html`<div class="channel-bar-buckets">${
                buckets.map((bucket, i) =>
                  html`${i ? ', ' : null}<span style="color: ${bucket.color}">${bucket.name}</span>`
                )
              }</div>`
            : null
          }
        </div>
        ${inActiveBucket
          ? html`
              <span
                  class="material-icons remove-channel"
                  .channel="${channel}"
                  @click="${removeChannel}"
                  @keypress="${enterIsClick}"
                  tabIndex="0">
                close
              </span>`
          : null
        }
      </div>
    `;
  }

  return html`
    <div class="name-delete-row">
      <input type="text" class="name-field" .value="${activeBucket.name}" style="color: ${activeBucket.color}" @change="${nameChange}">
      <button class="delete-button" @click="${deleteBucket}"><span class="material-icons">delete</span> DELETE</button>
    </div>

    <div class="color-choices">
      ${presetColors.map(color => {
        const classes = classMap({
          'color-choice': true,
          active: color == activeBucket.color,
        });
        return html`<button class="${classes}" style="--color: ${color}" @click="${setColor}"></button>`;
      })}
    </div>

    <div class="bucket-channel-editor">
      <div class="in-bucket-list">
        <div class="editor-subheading">Channels in bucket</div>
        ${channelsInActive.map(renderChannel)}
      </div>
      <span class="direction-hint material-icons">arrow_back_ios</span>
      <div class="not-in-bucket-list">
        ${channelsInNone.length
          ? html`<div class="editor-subheading">Unassigned channels</div>${channelsInNone.map(renderChannel)}`
          : null
        }
        ${channelsInOthers.length
          ? html`<div class="editor-subheading">Assigned to other buckets</div>${channelsInOthers.map(renderChannel)}`
          : null
        }
      </div>
    </div>
  `;
}

injectStyle(`
.name-delete-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 10px;
}

.name-field {
  background-color: transparent;
  border-style: none;
  border-bottom-style: solid;
  color: white;
  font-size: 24px;
  min-width: 0;
}

.delete-button {
  display: inline-flex;
  align-items: center;

  border-style: none;
  background-color: #fff1;
  color: white;
  border-radius: 4px;
  padding-top: 4px;
  padding-right: 9px;
  padding-bottom: 4px;
  margin-left: 20px;
}

.delete-button:hover {
  border-style: none;
  background-color: #f00;
}

.color-choices {
  grid-area: colors;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.color-choice {
  background-color: var(--color);
  width: 20px;
  height: 20px;
  border-radius: 100%;
  border-style: solid;
  border-color: black;
}

.color-choice.active {
  border-color: white;
}

@media (min-width: 600px) {
  .bucket-channel-editor {
    width: 90%;
  }
}

.bucket-channel-editor {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 30px 1fr;
  grid-column-gap: 20px;
  grid-template-areas:
    "in-list hint not-in-list";
}

.in-bucket-list {
  grid-area: in-list;
  border-style: none;
  border-width: 1px;
  border-color: #fff4;
  border-radius: 30px;
}

.editor-subheading {
  margin-top: 20px;
  margin-bottom: 10px;
}

.channel-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 50px;
  margin-bottom: 10px;

  background-color: #333;
  border-style: solid;
  border-color: #0009;
  border-radius: 30px;

  user-select: none;
}

.channel-bar-to-add:hover {
  background-color: #555;
}

.channel-bar-icon {
  border-radius: 100%;
  height: 48px;
  margin-top: 4px;
}

.channel-bar-text {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  flex-grow: 1;
}

.channel-bar-text > a {
  color: #fff;
  text-decoration: none;
}

.channel-bar-buckets {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.remove-channel {
  font-size: 40px;
  margin-right: 10px;
  color: #fff2;
  user-select: none;
}

.remove-channel:hover, .remove-channel:focus {
  color: #fff;
}

.direction-hint {
  grid-area: hint;
  justify-self: end;
  align-self: center;
}

.not-in-bucket-list {
  grid-area: not-in-list;
}
`);

function compareChannels(channelA, channelB) {
  return channelA.name.localeCompare(channelB.name);
}

function stopPropagation(event) {
  event.stopPropagation();
}

function nameChange(event) {
  Controller.updateName(event.target.value);
}

function deleteBucket(event) {
  Controller.deleteBucket();
}

function setColor(event) {
  Controller.setColor(event.target.style.getPropertyValue('--color').trim());
}

function removeChannel(event) {
  Controller.removeChannel(event.target.channel);
}

function addChannel(event) {
  let element = event.target;
  if (element.tagName == 'A') {
    return;
  }
  while (!element.channel) {
    element = element.parentElement;
  }
  Controller.addChannel(element.channel);
}