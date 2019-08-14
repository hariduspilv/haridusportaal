import { Component, Input, HostBinding } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'more-block',
  templateUrl: './more.block.template.html',
  styleUrls: ['./more.block.styles.scss'],
})

export class MoreBlockComponent {
  @Input() content: string;
  @Input() id: string;
  public cutoffs: Object = {
    lg: 66,
    sm: 110,
  };
  public active: boolean = false;
  public show: boolean = false;
  public links: any;
  public screenReaderContent: string = '';
  @HostBinding('class') get hostClasses(): string {
    return `${this.content ? 'content__box' : 'empty'} ${this.show ? 'show' : 'hide'}`;
  }
  constructor(private deviceDetector: DeviceDetectorService) {}
  ngAfterViewInit() {
    this.screenReaderContent = this.content ? this.content.replace(/<[^>]*>/g, '') : '';
    const contentElem = document.getElementById(`moreContent-${this.id}`);
    this.links = document.querySelectorAll(`#moreContent-${this.id} a`);
    this.setInnerLinkStates(this.show);
    if (this.deviceDetector.isDesktop() && contentElem && contentElem.clientHeight >= this.cutoffs['lg']) {
      this.active = true;
    } else if (this.deviceDetector.isMobile() && contentElem && contentElem.clientHeight >= this.cutoffs['sm']) {
      this.active = true;
    } else {
      this.show = true;
    }
  }
  setInnerLinkStates(state) {
    this.links.forEach((link) => {
      if (!state) {
        setTimeout(() => link.setAttribute('style', `visibility: ${state ? 'visible' : 'hidden'}`), 225);
      } else {
        link.setAttribute('style', `visibility: ${state ? 'visible' : 'hidden'}`);
      }
    });
  }
  changeState() {
    const newState = !this.show;
    this.setInnerLinkStates(newState);
    this.show = newState;
    if (newState) {
      document.getElementById(`wrapper-${this.id}`).focus();
    }
  }
}
