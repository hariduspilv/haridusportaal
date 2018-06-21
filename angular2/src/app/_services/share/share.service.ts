import { Injectable } from '@angular/core';

@Injectable()
export class ShareService{
  constructor(){}
  facebookShare () {
    const url = location.href
    const link = `https://www.facebook.com/sharer/sharer.php?u=http://htm.twn.ee/et/sundmused/meeldetuletus-pressikohtumine-lasteaiaharidusest`

    return window.open(link, 'ID_WIN', 'location=1,status=1,scrollbars=1')
  }
  twitterShare () {
    const url = location.href
    const link = `https://twitter.com/intent/tweet?text=${url}`

    return window.open(link, 'ID_WIN', 'location=1,status=1,scrollbars=1')
  }
}