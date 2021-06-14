import { Injectable } from '@angular/core';

interface SupportedVideoPlatform {
  videoMatch: string;
  embedUrl: string;
  thumbnailUrl: string;
}
@Injectable({
  providedIn: 'root',
})
export class VideoEmbedService {
  public supportedPlatforms: SupportedVideoPlatform[] = [
    {
      videoMatch: 'youtube\\.com\\/watch\\?v\\=([^#?&]+)$',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
    },
    {
      videoMatch: 'youtu\\.be\\/([^#?&]+)$',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
    },
    {
      videoMatch: 'vimeo.com\\/([^#?&]+)$',
      embedUrl: 'https://player.vimeo.com/video/{id}',
      thumbnailUrl: 'https://player.vimeo.com/video/{id}',
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

    const videoId = url.match(platform.videoMatch)[1];
    return [
      videoId,
      platform.embedUrl.replace('{id}', videoId),
      platform.thumbnailUrl.replace('{id}', videoId),
    ];
  }

  public mapVideoList(list: { input?: string }[]): Record<string, string>[] {
    return list.filter((record) => record.input).map((record) => {
      const [videoId, videoEmbed, videoThumbnail] = this.getVideoParameters(record.input);
      return {
        ...record, videoId, videoEmbed, videoThumbnail,
      };
    });
  }
}
