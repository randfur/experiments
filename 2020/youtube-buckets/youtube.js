export let YouTube = class {
  static recordedData = {
    subscriptionPages: [],
    channelUploadsPlaylistIdMap: {},
    playlistPage: {},
  };

  static async init() {
    await new Promise(resolve => {
      gapi.load('client:auth2', resolve);
    });

    await gapi.auth2.init({
      client_id: "1042104948081-itv24rq43ue0226l51t3fribikh1fcd1.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/youtube.readonly",
    });
    
    gapi.client.setApiKey("AIzaSyDj_nbHCDc06tLs2wfn2o_f0VswBsVDBDQ");
    await gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest");
  }
  
  static isSignedIn() {
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  }
  
  static async* loadSubscriptions() {
    let count = 0;
    let pageToken = null;
    while (true) {
      ++count;
      if (count > 10) {
        console.warn('Hit max subscription fetch limit.');
        break;
      }
      const packet = await gapi.client.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50,
        order: 'alphabetical',
        pageToken,
      });
      const subscriptionPage = packet.result.items.map(item => item.snippet);
      YouTube.recordedData.subscriptionPages.push(subscriptionPage);
      yield subscriptionPage;
      pageToken = packet.result.nextPageToken;
      if (!pageToken) {
        break;
      }
    }
  }
  
  static async loadChannelUploadsPlaylistIdMap(channelIds) {
    const packet = await gapi.client.youtube.channels.list({
      part: ['contentDetails'],
      id: channelIds,
    });
    const result = {};
    for (const item of packet.result.items) {
      result[item.id] = item.contentDetails.relatedPlaylists.uploads;
    }
    YouTube.recordedData.channelUploadsPlaylistIdMap[JSON.stringify(arguments)] = result;
    return result;
  }
  
  static async loadPlaylistPage(playlistId, pageToken) {
    const playlistPacket = await gapi.client.youtube.playlistItems.list({
      part: ['contentDetails'],
      playlistId,
      maxResults: 20,
      pageToken,
    });
    const videoIds = playlistPacket.result.items.map(item => item.contentDetails.videoId);
    const videoPacket = await gapi.client.youtube.videos.list({
      part: [
        "contentDetails",
        "snippet"
      ],
      id: videoIds,
    });

    const result = {
      videos: videoPacket.result.items,
      nextPageToken: playlistPacket.nextPageToken,
    };
    YouTube.recordedData.playlistPage[JSON.stringify(arguments)] = result;
    return result;
  }
  
  static useRecordedData(recordedData) {
    YouTube = class {
      static recordedData = recordedData;
      static async init() {}
      static isSignedIn() { return true; }
      static async* loadSubscriptions() {
        yield* recordedData.subscriptionPages;
      }
      static async loadChannelUploadsPlaylistIdMap() {
        return recordedData.channelUploadsPlaylistIdMap[JSON.stringify(arguments)];
      }
      static async loadPlaylistPage() {
        return recordedData.playlistPage[JSON.stringify(arguments)];
      }
    };
  }
}

globalThis.exportRecordedYouTubeData = function() {
  return YouTube.recordedData;
}