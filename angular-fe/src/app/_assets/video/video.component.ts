import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';

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
  @Input() responsive = false;
  @Output() onLoad: EventEmitter<void> = new EventEmitter();

  public videoArray: VideoItem[] = [];

  public embedFailed = false;
  public embeddedInputs: VideoItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private videoService: VideoEmbedService,
  ) {}

  ngOnChanges(): void {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.videoArray = (this.videoService.mapVideoList(
      Array.isArray(this.videos) ? this.videos : [this.videos],
    ) as unknown as VideoItem[])
    .map((vid) => {
      const url = vid.videoEmbed || `${window.location.protocol}//www.youtube.com/embed/${vid.videoId}?hl=et`;
      vid.finalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      return vid;
    });
    this.embedFailed = true;
  }
}
