import { Injectable } from '@angular/core';

interface SupportedVideoPlatform {
  videoMatch: string;
  embedUrl: string;
  wholeUrl?: boolean;
  thumbnailUrl?: string;
}
@Injectable({
  providedIn: 'root',
})
export class VideoEmbedService {
  public supportedPlatforms: SupportedVideoPlatform[] = [
    {
      videoMatch: 'youtube\\.com/watch\\?v=([^#?&]+)',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
    },
    {
      videoMatch: 'youtu\\.be/([^#?&]+)',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
    },
    {
      videoMatch: 'vimeo\\.com/([^#?&]+)$',
      embedUrl: 'https://player.vimeo.com/video/{id}',
    },
    {
      videoMatch: 'facebook\\.com/([^#?&/]+)/videos/([^#?&]+)',
      embedUrl: 'https://www.facebook.com/plugins/video.php?href={id}&show_text=0',
      wholeUrl: true,
    },
    {
      videoMatch: 'fb\\.watch/v/([^#?&]+)',
      embedUrl: 'https://www.facebook.com/plugins/video.php?href={id}&show_text=0',
      wholeUrl: true,
    },
    {
      videoMatch: 'facebook\\.com/watch/\\?v=([^#?&]+)',
      embedUrl: 'https://www.facebook.com/plugins/video.php?href={id}&show_text=0',
      wholeUrl: true,
    },
    {
      videoMatch: 'biteable\\.com/watch/([^#?&]+)',
      embedUrl: 'https://www.biteable.com/watch/embed/{id}',
    },
  ];

  public getSupportedPlatform(url: string): SupportedVideoPlatform {
    return this.supportedPlatforms.find((platform) => url.match(platform.videoMatch));
  }

  public getVideoParameters(url: string): string[] {
    const platform = this.getSupportedPlatform(url);
    if (!platform) {
      return [url, url, url];
    }

    const videoId = platform.wholeUrl
      ? encodeURIComponent(url) : url.match(platform.videoMatch)[1];

    return [
      videoId,
      platform.embedUrl.replace('{id}', videoId),
      platform.thumbnailUrl ? platform.thumbnailUrl.replace('{id}', videoId) : undefined,
    ];
  }

  public mapVideo(record: { input?: string; videoThumbnail?: string }, derivative?: string): Record<string, string> {
    const [videoId, videoEmbed, videoThumbnail] = this.getVideoParameters(record.input);
    return {
      ...record, videoId, videoEmbed, videoThumbnail: derivative || record.videoThumbnail || videoThumbnail,
    };
  }

  public mapVideoList(list: { input?: string }[], derivative?: string): Record<string, string>[] {
    return list.filter((record) => record.input).map((record) => this.mapVideo(record, derivative));
  }
}
