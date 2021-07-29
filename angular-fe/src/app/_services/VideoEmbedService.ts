import { Injectable } from '@angular/core';

interface SupportedVideoPlatform {
  videoMatch: string;
  embedUrl: string;
  wholeUrl?: boolean;
  thumbnailUrl?: string;
  domainMatch?: string[];
}

interface InputVideo {
  input?: string;
  videoThumbnail?: string;
  videoDomain?: string;
  videoId?: string;
  videoEmbed?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoEmbedService {
  public supportedPlatforms: SupportedVideoPlatform[] = [
    {
      domainMatch: ['youtube', 'youtube.com'],
      videoMatch: 'youtube\\.com/watch\\?v=([^#?&]+)',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
    },
    {
      domainMatch: ['vimeo', 'vimeo.com'],
      videoMatch: 'vimeo\\.com/([^#?&]+)$',
      embedUrl: 'https://player.vimeo.com/video/{id}',
    },
    {
      domainMatch: ['facebook', 'facebook.com'],
      videoMatch: 'facebook\\.com/([^#?&/]+)/videos/([^#?&]+)',
      embedUrl: 'https://www.facebook.com/plugins/video.php?href={id}&show_text=0',
      wholeUrl: true,
    },
    {
      videoMatch: 'youtu\\.be/([^#?&]+)',
      embedUrl: 'https://youtube.com/embed/{id}',
      thumbnailUrl: 'https://img.youtube.com/vi/{id}/0.jpg',
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

  public getSupportedPlatform(url: string, domain?: string): SupportedVideoPlatform {
    return this.supportedPlatforms.find((platform) => {
      if (domain && platform.domainMatch && platform.domainMatch.includes(domain)) {
        return true;
      }
      return url.match(platform.videoMatch) != null;
    });
  }

  public getVideoParameters(url: string, domain?: string, videoId?: string): string[] {
    const platform = this.getSupportedPlatform(url, domain);
    if (!platform) {
      return [url, url, url];
    }

    let newVideoId = videoId;
    if (!videoId || videoId.startsWith('http') || platform.wholeUrl || !platform.domainMatch) {
      newVideoId = platform.wholeUrl
        ? encodeURIComponent(url) : url.match(platform.videoMatch)[1];
    }

    return [
      newVideoId,
      platform.embedUrl.replace('{id}', newVideoId),
      platform.thumbnailUrl ? platform.thumbnailUrl.replace('{id}', newVideoId) : undefined,
    ];
  }

  public mapVideo(record: InputVideo, derivative?: string): Record<string, string> {
    // Already properly mapped
    if (record.videoThumbnail && record.videoEmbed) {
      return record as Record<string, string>;
    }

    const [videoId, videoEmbed, videoThumbnail] = this.getVideoParameters(record.input, record.videoDomain, record.videoId);
    return {
      ...record, videoId, videoEmbed, videoThumbnail: derivative || record.videoThumbnail || videoThumbnail,
    };
  }

  public mapVideoList(list: InputVideo[], derivative?: string): Record<string, string>[] {
    return list.filter((record) => record.input).map((record) => this.mapVideo(record, derivative));
  }
}
