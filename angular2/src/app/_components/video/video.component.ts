import {Component, Input} from '@angular/core';
import {EmbedVideoService} from 'ngx-embed-video';

@Component({
  selector: 'video-component',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss']
})

export class VideoComponent {

  @Input() videoObject: any;
  videoUrl: string = "";

  constructor(private embedService: EmbedVideoService){}
  
  ngOnInit() {
    this.videoUrl = this.embedService.embed(this.videoObject.input);
  }
  
}
