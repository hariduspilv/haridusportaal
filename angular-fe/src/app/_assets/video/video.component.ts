import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface VideoItem {
  input: string;
  videoDomain: string;
  videoDescription: string;
  videoId: string;
  videoEmbed: string;
  videoThumbnail: string;
  finalUrl: SafeResourceUrl;
}

@Component({
  selector: 'htm-video',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss'],
})

export class VideoComponent implements OnInit, OnChanges {
  @Input() videos: VideoItem | VideoItem[];
  @Output() onLoad: EventEmitter<void> = new EventEmitter();

  public videoArray: VideoItem[] = [];

  public embedFailed = false;
  public embeddedInputs: VideoItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(): void {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.videoArray = (Array.isArray(this.videos) ? this.videos : [this.videos])
    .map((vid) => {
      const url = vid.videoEmbed || `${window.location.protocol}//www.youtube.com/embed/${vid.videoId}?hl=et`;
      vid.finalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      return vid;
    });
    this.embedFailed = true;
  }
}
