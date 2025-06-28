import {createDefaultBucket} from './utils.js';

/*
struct Model {
  stored: struct {
    buckets: [Bucket],
  },

  downloaded: struct {
    channels: map[id: string]: Channel,
  },

  session: struct {
    showHelp: bool,
    state: enum {
      initalising,
      signin,
      active {
        activeBucketName: string,
        editing: bool,
      },
    },
  },
}

struct Bucket {
  name: string,
  color: string,
  channelIds: [string],
}

struct Channel {
  name: string,
  url: string,
  iconUrl: string,
  uploadsPlaylistId: Promise<string>,
  videos: [Video],
  downloadState: enum {
    paused {
      nextPageToken: ?string,
    },
    pending,
    complete,
  },
}

struct Video {
  name: string,
  url: string,
  durationSeconds: number,
  uploadDate: number,
  thumbnailUrl: string,
  channelId: string,
}
*/

export class Model {
  static stored = {
    buckets: [],
  };

  static downloaded = {
    channels: [],
  };
  
  static session = {
    showHelp: false,
    state: {
      type: 'initialising',
    },
  };

  static save() {
    localStorage.setItem('', JSON.stringify(Model.stored));
  }

  static load() {
    try {
      const saved = JSON.parse(localStorage.getItem(''));
      if (saved) {
        Model.stored = saved;
      }
    } catch {}
  }
}

window.model = Model;
