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
  embedFailed: boolean = false;

  constructor(private embedService: EmbedVideoService, private sanitizer: DomSanitizer){}

  ngOnInit() {
    try {
      this.videos = this.videos.map((vid) => {
        vid.embeddedInput = this.embedService.embed(vid.input)
      })
    } catch {
      this.embedFailed = true;
    } finally {
      console.log(this.videos)
    }
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
