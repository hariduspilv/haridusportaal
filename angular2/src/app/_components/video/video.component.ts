import {Component, Input} from '@angular/core';
import {EmbedVideoService} from 'ngx-embed-video';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'video-component',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss']
})

export class VideoComponent {

  @Input() videos: any;

  constructor(private embedService: EmbedVideoService, private sanitizer: DomSanitizer){}
  
  videoUrl(url) {
    return this.embedService.embed(url);
  }

  fallbackUrl(domain, id) {
    switch (domain) {
      case 'youtube.com':
        return `https://www.youtube.com/embed/${id}`;
      default:
        return null
    }
  }
}
