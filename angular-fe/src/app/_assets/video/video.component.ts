import { Component, Input, OnChanges, OnInit } from '@angular/core';
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

export class VideoComponent implements OnInit, OnChanges {

  @Input() videos;
  public videoArray: VideoItem[] = [];

  public embedFailed: boolean = false;
  public embeddedInputs: VideoItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges() {
    this.ngOnInit();
  }

  ngOnInit() {

    if (!Array.isArray(this.videos)) {
      this.videoArray = [this.videos];
    } else {
      this.videoArray = this.videos;
    }

    try {
      this.videoArray = this.videoArray.map((vid) => {
        const url = `${window.location.protocol}//www.youtube.com/embed/${vid.videoId}`;
        vid.finalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return vid;
      });
      this.embedFailed = true;
    } catch {}
  }
}
