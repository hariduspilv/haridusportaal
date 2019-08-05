import { Component, Input } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { DomSanitizer } from '@angular/platform-browser';

export interface VideoItem {
  input: string;
  videoDomain: string;
  videoDescription: string;
  videoId: string;
  finalUrl: any;
}

@Component({
  selector: 'htm-video',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss'],
})

export class VideoComponent {

  @Input() videos: VideoItem[] = [];
  public embedFailed: boolean = false;
  public embeddedInputs: VideoItem[] = [];

  constructor(
    private embedService: EmbedVideoService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    try {
      return this.videos.forEach((vid) => {
        return this.embeddedInputs.push(this.embedService.embed(vid.input));
      });
    } catch {
      this.videos = this.videos.map((vid) => {
        const url = `${window.location.protocol}//www.youtube.com/embed/${vid.videoId}`;
        vid.finalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return vid;
      });
      this.embedFailed = true;
    }
  }
}
