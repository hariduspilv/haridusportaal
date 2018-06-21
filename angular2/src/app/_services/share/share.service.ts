import { Injectable } from '@angular/core';

@Injectable()
export class ShareService{
  constructor(){}
  share (facebook) {
    const url = location.href
    const link = facebook ? `https://www.facebook.com/sharer/sharer.php?u=${url}` : `https://twitter.com/intent/tweet?text=${url}`
    return window.open(link, 'ID_WIN', 'location=1,status=1,scrollbars=1')
  }
}