import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "share",
  templateUrl: "share.template.html",
  styleUrls: ["share.styles.scss"]
})

export class ShareComponent{
  constructor(private snackbar: MatSnackBar, private translate: TranslateService) {}

  @Input() title: String;
  public item: any = false;
  public transitionState: boolean = false;

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

  copyToClipboard () {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (window.location.href));
      e.preventDefault();
      document.removeEventListener('copy', null);
      let message = `${this.translate.get('url.copied_to_clipboard')['value']}`;
      let action = `${this.translate.get('button.close')['value']}`;
      this.snackbar.open(message, action, {
        duration: 5000,
      });
    });
    document.execCommand('copy');
  }
}