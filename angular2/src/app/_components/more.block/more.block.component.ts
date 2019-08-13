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
  @HostBinding('class') get hostClasses(): string {
    return `${this.content ? 'content__box' : 'empty'} ${this.show ? 'show' : 'hide'}`;
  }
  ngAfterViewInit() {
    const contentElem = document.getElementById(`moreContent-${this.id}`);
    if (contentElem && contentElem.clientHeight >= this.cutoff) {
      this.active = true;
    } else {
      this.show = true;
    }
  }
}
