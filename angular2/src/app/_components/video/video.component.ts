import {Component, Input} from '@angular/core';
import {EmbedVideoService} from 'ngx-embed-video';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'video-component',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss']
})

export class VideoComponent {

  @Input() videoObject: any;
  videoUrl: string = "";

  constructor(private embedService: EmbedVideoService, private sanitizer: DomSanitizer){}
  
  ngOnInit() {
    this.videoUrl = this.embedService.embed(this.videoObject.input);
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
