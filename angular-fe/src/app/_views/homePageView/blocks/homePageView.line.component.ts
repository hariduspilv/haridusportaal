import { Component, Input } from '@angular/core';

@Component({
  selector: 'homepage-line',
  templateUrl: 'homePageView.line.html',
})
export class HomePageLineComponent {
  @Input() type: number = 1;
}
