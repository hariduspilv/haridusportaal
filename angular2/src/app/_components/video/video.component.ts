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
  embeddedInputs: any = [];

  constructor(private embedService: EmbedVideoService, private sanitizer: DomSanitizer){}

  ngOnInit() {
    try {
      return this.videos.forEach((vid) => {
        return this.embeddedInputs.push(this.embedService.embed(vid.input))
      });
    } catch {
      this.videos = this.videos.map((vid) => {
        vid.finalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${window.location.protocol}//www.youtube.com/embed/${vid.videoId}`);
        return vid;
      });
      this.embedFailed = true;
    }
  }
}
