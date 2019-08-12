import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'more-block',
  templateUrl: './more.block.template.html',
  styleUrls: ['./more.block.styles.scss'],
})

export class MoreBlockComponent {
  @Input() content: string;
  private show: boolean = false;
  @HostBinding('class') get hostClasses(): string {
    return `content__box ${this.show ? 'show' : 'hide'}`;
  }
}
