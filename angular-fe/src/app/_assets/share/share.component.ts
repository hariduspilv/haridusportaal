import { Component, HostBinding, Input, OnInit, HostListener } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { AlertsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'share',
  templateUrl: 'share.template.html',
  styleUrls: ['share.styles.scss'],
})

export class ShareComponent {
  public isFocused: boolean = false;
  public isHovered: boolean = false;

  public copyLink = decodeURI(window.location.href);
  public isTouchDevice: boolean = false;

  @Input() pageTitle: string;
  @HostBinding('class') get hostClasses(): string {
    return this.isFocused || this.isHovered ? 'share--focused' : '';
  }

  @HostListener('mouseenter') onMouseEnter($event) {
    if (this.device.isDesktop()) {
      this.hostFocused(true, $event);
    }
  }

  @HostListener('mouseleave') onMouseLeave($event) {
    if (this.device.isDesktop()) {
      this.hostBlurred(true, $event);
    }
  }

  @HostListener('blur') onBlur($event) {
    this.isFocused = false;
    this.isHovered = false;
  }

  @HostListener('touchLeave') onTouchLeave($event) {
    this.isFocused = false;
    this.isHovered = false;
  }

  @HostListener('touchstart') onTouchStart($event) {
    this.hostFocused(true, $event);
  }

  constructor(
    private clipboardService: ClipboardService,
    private alertsService: AlertsService,
    private translateService: TranslateService,
    private device: DeviceDetectorService,
  ) {
    this.isTouchDevice = !this.device.isDesktop();
  }

  public share ($event: Event, type: string) {
    $event.preventDefault();
    $event.stopPropagation();
    const url = location.href;
    let shareLink = '';
    this.isFocused = false;
    this.isHovered = false;
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

  public hostFocused(hover: boolean = false, $event:any = false) {
    if (hover) {
      this.isHovered = true;
    } else {
      this.isFocused = true;
    }
    if ($event && !this.isHovered) {
      $event.preventDefault();
    }
  }

  public hostBlurred(hover: boolean = false, $event:any = false) {
    if (hover) {
      this.isHovered = false;
    } else {
      this.isFocused = false;
    }

    console.log(this.isHovered, this.isFocused);
    if ($event && !this.isHovered) {
      $event.preventDefault();
    }
  }

  public copyLinkToClipboard($event) {

    if ($event === 'click' && !this.device.isDesktop()) {
      return false;
    }

    this.clipboardService.copyFromContent(this.copyLink);

    setTimeout(() => {
      this.alertsService.success(
        this.translateService.get('url.copied_to_clipboard'),
        'global',
        'share',
        true,
        false,
      );
      this.isFocused = false;
      this.isHovered = false;
    }, 0);
  }

}
