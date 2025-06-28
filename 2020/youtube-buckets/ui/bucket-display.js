import {html} from 'https://unpkg.com/lit-html?module';
import {classMap} from 'https://unpkg.com/lit-html/directives/class-map?module';
import {injectStyle, getActiveBucket} from '../utils.js'
import {Model} from '../model.js'

export function bucketDisplay() {
  const activeBucket = getActiveBucket();
  if (!activeBucket) {
    return html`No active bucket`;
  }

  const videos = activeBucket.channelIds.flatMap(channelId => {
    const channel = Model.downloaded.channels[channelId];
    if (!channel) {
      return [];
    }
    return channel.videos.map(video => ({...video, channelId, channel}));
  });
  videos.sort((a, b) => b.uploadDate - a.uploadDate);

  return html`
    <div class="bucket-display">
      ${videos.map(video => {
        return html`
          <a class="video" href="${video.url}" target="_blank">
            <div class="video-image-container">
              <img src=${video.thumbnailUrl}>
              <div class="timestamp">${formatDuration(video.durationSeconds)}</div>
            </div>
            <div class="video-name">${video.name}</div>
            <div class="sub-video-name">
              ${html`<a href="${channelVideosURL(video.channelId)}" target="_blank" tabIndex="-1"><img class="channel-icon" src="${video.channel.iconUrl}"></a>`}
              <div>
                ${html`<a class="channel-link" href="${channelVideosURL(video.channelId)}" target="_blank">${video.channel.name}</a>`}
                <div>${formatUploadDate(video.uploadDate)}</div>
              </div>
            </div>
          </a>
        `;
      })}
    </div>
  `;
}

injectStyle(`
.bucket-display {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 600px) {
  .video {
    width: auto;
  }

  .video-image-container {
    width: calc(100vw - 15px);
  }
}

.video {
  width: 250px;
  margin-bottom: 20px;
  margin-right: 10px;
}

.video-image-container {
  position: relative;
}

.video-image-container > img {
  width: 100%;
}

a.video {
  text-decoration: none;
  color: white;
}

.video-name {
  color: white;
  font-size: 17px;
}

.sub-video-name {
  display: flex;
  flex-direction: row;
  color: #888;
  margin-top: 7px;
  font-size: 12px;
}

.channel-icon {
  border-radius: 100%;
  width: 30px;
  margin-right: 6px;
}

a.channel-link {
  color: inherit;
  text-decoration: none;
}

a.channel-link:hover {
  color: white;
}

.timestamp {
  position: absolute;
  right: 2px;
  bottom: 6px;
  background-color: #2228;
  padding: 2px 3px;
  font-size: 13px;
  border-radius: 4px;
}
`);

function channelVideosURL(channelId) {
  return `https://www.youtube.com/channel/${channelId}/videos`;
}

function formatDuration(seconds) {
  return new Date(1000 * seconds).toISOString().substr(11, 8).replace('00:', '')
}

const durationUnits = [
  { unit: 'minute', nextUnitFactor: 60 },
  { unit: 'hour', nextUnitFactor: 24 },
  { unit: 'day', nextUnitFactor: 7 },
  { unit: 'week', nextUnitFactor: 4 },
  { unit: 'month', nextUnitFactor: 12 },
  { unit: 'year', nextUnitFactor: Infinity },
]

function formatUploadDate(uploadDate) {
  let durationAgo = Math.round((Date.now() - uploadDate) / 1000 / 60);
  if (durationAgo < 1) {
    return 'now';
  }
  for (const {unit, nextUnitFactor} of durationUnits) {
    if (durationAgo < nextUnitFactor) {
      return `${durationAgo} ${unit}${durationAgo == 1 ? '' : 's'} ago`;
    }
    durationAgo = Math.round(durationAgo / nextUnitFactor);
  }
}
