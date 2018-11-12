import { Component, Input, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard'

@Component({
  selector: "share",
  templateUrl: "share.template.html",
  styleUrls: ["share.styles.scss"]
})

export class ShareComponent{
  constructor(private snackbar: MatSnackBar, private translate: TranslateService,
  private _clipboardService: ClipboardService) {}

  @Input() title: String;
  public item: any = false;
  public transitionState: boolean = false;
  public copyLink: string = '';
  public activeState: boolean = false;
  public mainShareElemLabel: string = 'tooltip.share';

  share ($event, type) {
    $event.preventDefault();
    $event.stopPropagation();
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

  ngOnInit () {
    this.copyLink = window.location.href;
  }

  stateChangeWithCopy ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.activeState) {
      this._clipboardService.copyFromContent(this.copyLink);
      let message = `${this.translate.get('url.copied_to_clipboard')['value']}`;
      let action = `${this.translate.get('button.close')['value']}`;
      this.snackbar.open(message, action, {
        duration: 5000,
      });
    }
    this.activeState = !this.activeState;
    if (this.activeState) {
      this.mainShareElemLabel = 'tooltip.copy';
    } else {
      this.mainShareElemLabel = 'tooltip.share';
      let elem = document.getElementById('mainShareElem');
      elem.focus();
    }
  }

  copyLocation ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this._clipboardService.copyFromContent(this.copyLink);
    let message = `${this.translate.get('url.copied_to_clipboard')['value']}`;
    let action = `${this.translate.get('button.close')['value']}`;
    this.snackbar.open(message, action, {
      duration: 5000,
    });
  }

  resetActiveState () {
    if (this.activeState) {
      this.activeState = false;
      this.mainShareElemLabel = 'tooltip.share';
      let elem = document.getElementById('mainShareElem');
      elem.focus();
    }
  }

  @HostListener('document:click', ['$event']) clickedOutside($event){
    this.resetActiveState();
  }
}