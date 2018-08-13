import { Component } from '@angular/core';

@Component({
  selector: "share",
  templateUrl: "share.template.html",
  styleUrls: ["share.styles.scss"]
})

export class ShareComponent{
  share (type) {
    const url = location.href;
    let shareLink = '';
    switch (type) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${url}`;
        break;
      default:
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }
    return window.open(shareLink, 'ID_WIN', 'location=1,status=1,scrollbars=1')
  }
}