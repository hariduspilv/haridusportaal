import { Component } from '@angular/core';

@Component({
  selector: "share",
  templateUrl: "share.template.html",
  styleUrls: ["share.styles.scss"]
})

export class ShareComponent{
  share (facebook) {
    const url = location.href
    const link = facebook ? `https://www.facebook.com/sharer/sharer.php?u=${url}` : `https://twitter.com/intent/tweet?text=${url}`
    return window.open(link, 'ID_WIN', 'location=1,status=1,scrollbars=1')
  }
}