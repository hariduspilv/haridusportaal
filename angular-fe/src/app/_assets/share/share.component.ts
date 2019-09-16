import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { AlertsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'share',
  templateUrl: 'share.template.html',
  styleUrls: ['share.styles.scss'],
})

export class ShareComponent {
  public isFocused: boolean = false;
  public copyLink = decodeURI(window.location.href);

  @Input() pageTitle: string;
  @HostBinding('class') get hostClasses(): string {
    return this.isFocused ? 'share--focused' : '';
  }

  constructor(
    private clipboardService: ClipboardService,
    private alertsService: AlertsService,
    private translateService: TranslateService,
  ) {}

  public share ($event: Event, type: string) {
    $event.preventDefault();
    $event.stopPropagation();
    const url = location.href;
    let shareLink = '';
    switch (type) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${this.pageTitle} - ${url}`;
        break;
      default:
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    // tslint:disable-next-line: max-line-length
    const shareWindow = 'toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=560,height=460';

    return window.open(shareLink, 'targetWindow', shareWindow);
  }

  public hostFocused(): void {
    this.isFocused = true;
  }

  public hostBlurred(): void {
    this.isFocused = false;
  }

  public copyLinkToClipboard(): void {
    this.alertsService.success(
      this.translateService.get('url.copied_to_clipboard'),
      'global',
      'share',
      true,
      false,
    );
    this.clipboardService.copyFromContent(this.copyLink);
  }

}
