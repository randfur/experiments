import {Model} from './model.js';
import {rerender} from './main.js';
import {YouTube} from './youtube.js';
import {getActiveBucket, presetColors, createDefaultBucket, parseIso8601InSeconds} from './utils.js';

export class Controller {
  static async init() {
    Model.load();
    if (Model.stored.buckets.length == 0) {
      Model.stored.buckets.push(createDefaultBucket());
    }

    await YouTube.init();

    if (!YouTube.isSignedIn()) {
      Model.session.state = {
        type: 'signin',
      };
      rerender();
      return;
    }
    
    Model.session.state = {
      type: 'active',
      activeBucketName: Model.stored.buckets[0].name,
      editing: false,
    };
    rerender();

    for await (const subscriptionPage of YouTube.loadSubscriptions()) {
      const uploadsMap = await YouTube.loadChannelUploadsPlaylistIdMap(subscriptionPage.map(subscription => subscription.resourceId.channelId));
      for (const subscription of subscriptionPage) {
        const channelId = subscription.resourceId.channelId;
        Model.downloaded.channels[channelId] = {
          name: subscription.title,
          url: `https://youtube.com/channel/${channelId}`,
          iconUrl: subscription.thumbnails.default.url,
          uploadsPlaylistId: uploadsMap[channelId],
          videos: [],
          downloadState: {
            type: 'paused',
            pageToken: null,
          },
        };
      }
      ensureActiveBucketVideosLoading();
      rerender();
    }
    
    for (const bucket of Model.stored.buckets) {
      bucket.channelIds = bucket.channelIds.filter(channelId => channelId in Model.downloaded.channels);
    }
    Model.save();
  }

  static toggleHelp() {
    Model.session.showHelp ^= true;
    rerender();
  }

  static switchToBucket(bucketName) {
    Model.session.state.activeBucketName = bucketName;
    ensureActiveBucketVideosLoading();
    rerender();
  }

  static newBucket() {
    const existingNames = new Set(Model.stored.buckets.map(bucket => bucket.name));
    let attempts = 1;
    let newName = 'Untitled';
    while (existingNames.has(newName)) {
      newName = `Untitled ${++attempts}`;
    }
    Model.stored.buckets.push({
      name: newName,
      color: presetColors[0],
      channelIds: [],
    });
    Model.session.state.activeBucketName = newName;
    Model.session.state.editing = true;
    Model.save();
    rerender();
  }

  static toggleEdit() {
    Model.session.state.editing ^= true;
    if (!Model.session.state.editing) {
      ensureActiveBucketVideosLoading();
    }
    rerender();
  }

  static moveLeft() {
    for (let i = 1; i < Model.stored.buckets.length; ++i) {
      if (Model.stored.buckets[i].name == Model.session.state.activeBucketName) {
        const bucket = Model.stored.buckets.splice(i, 1)[0];
        Model.stored.buckets.splice(i - 1, 0, bucket);
        Model.save();
        rerender();
        return;
      }
    }
  }

  static moveRight() {
    for (let i = 0; i < Model.stored.buckets.length - 1; ++i) {
      if (Model.stored.buckets[i].name == Model.session.state.activeBucketName) {
        const bucket = Model.stored.buckets.splice(i, 1)[0];
        Model.stored.buckets.splice(i + 1, 0, bucket);
        Model.save();
        rerender();
        return;
      }
    }
  }

  static updateName(newName) {
    if (newName && Model.stored.buckets.every(bucket => bucket.name != newName)) {
      getActiveBucket().name = newName;
      Model.session.state.activeBucketName = newName;
      Model.save();
      rerender();
    }
  }

  static deleteBucket() {
    const buckets = Model.stored.buckets;
    for (let i = 0; i < buckets.length; ++i) {
      if (buckets[i].name == Model.session.state.activeBucketName) {
        buckets.splice(i, 1);
        if (buckets.length == 0) {
          buckets.push(createDefaultBucket());
        }
        Model.session.state.activeBucketName = buckets.length > 0 ? buckets[Math.min(i, buckets.length - 1)].name : null;
        ensureActiveBucketVideosLoading();
        rerender();
        Model.save();
        return;
      }
    }
  }

  static setColor(color) {
    getActiveBucket().color = color;
    Model.save();
    rerender();
  }

  static addChannel(channel) {
    for (const [id, otherChannel] of Object.entries(Model.downloaded.channels)) {
      if (otherChannel == channel) {
        getActiveBucket().channelIds.push(id);
        Model.save();
        rerender();
        return;
      }
    }
  }

  static removeChannel(channel) {
    for (const [id, otherChannel] of Object.entries(Model.downloaded.channels)) {
      if (otherChannel == channel) {
        const bucket = getActiveBucket();
        bucket.channelIds.splice(bucket.channelIds.indexOf(id), 1);;
        Model.save();
        rerender();
        return;
      }
    }
  }
}

function ensureActiveBucketVideosLoading() {
  console.log('ensureActiveBucketVideosLoading');
  for (const channelId of getActiveBucket().channelIds) {
    const channel = Model.downloaded.channels[channelId];
    if (!channel || channel.downloadState.type != 'paused' || channel.downloadState.nextPageToken != null) {
      continue;
    }
    channel.downloadState = {type: 'pending'};
    (async () => {
      const {videos, nextPageToken} = await YouTube.loadPlaylistPage(channel.uploadsPlaylistId, null);
      channel.downloadState = nextPageToken ? {
        type: 'paused',
        nextPageToken,
      } : {
        type: 'complete'
      };
      for (const video of videos) {
        channel.videos.push({
          name: video.snippet.title,
          url: `https://youtube.com/watch?v=${video.id}`,
          durationSeconds: parseIso8601InSeconds(video.contentDetails.duration),
          uploadDate: Date.parse(video.snippet.publishedAt),
          thumbnailUrl: video.snippet.thumbnails.medium.url,
          channelId,
        });
      }
      rerender();
    })();
  }
}