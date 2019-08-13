import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'more-block',
  templateUrl: './more.block.template.html',
  styleUrls: ['./more.block.styles.scss'],
})

export class MoreBlockComponent {
  @Input() content: string;
  @Input() id: string;
  public cutoff: number = 66;
  public active: boolean = false;
  public show: boolean = false;
  public links: any;
  public screenReaderContent: string = '';
  @HostBinding('class') get hostClasses(): string {
    return `${this.content ? 'content__box' : 'empty'} ${this.show ? 'show' : 'hide'}`;
  }
  ngAfterViewInit() {
    this.screenReaderContent = this.content ? this.content.replace(/<[^>]*>/g, '') : '';
    const contentElem = document.getElementById(`moreContent-${this.id}`);
    this.links = document.querySelectorAll(`#moreContent-${this.id} a`);
    this.setInnerLinkStates(this.show);
    if (contentElem && contentElem.clientHeight >= this.cutoff) {
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
