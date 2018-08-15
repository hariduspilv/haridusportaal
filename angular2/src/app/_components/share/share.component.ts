import { Component, Input } from '@angular/core';

@Component({
  selector: "share",
  templateUrl: "share.template.html",
  styleUrls: ["share.styles.scss"]
})

export class ShareComponent{
  @Input() title: String;

  share (type) {
    const url = location.href;
    let shareLink = '';
    switch (type) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${this.title} - ${url}`;
        break;
      default:
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }
    
    return window.open(shareLink, 'targetWindow', 'toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=560,height=460')
  }
}