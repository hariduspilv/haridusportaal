import { Component, Input, HostBinding } from '@angular/core';
import { ITopic } from '../../homePageView.model';
import { isMainPage } from "@app/_core/router-utility";

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'homePageView.navblock.html',
})
export class HomePageNavBlockComponent {
  @Input() data: ITopic[];
  @Input() title: string;
  @Input() description: string;
  @Input() theme: string;
  @Input() image: string;

	public isOnMainPage = isMainPage();

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
