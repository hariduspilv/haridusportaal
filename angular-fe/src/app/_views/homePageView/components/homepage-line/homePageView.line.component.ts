import { Component, Input } from '@angular/core';

@Component({
  selector: 'homepage-line',
  templateUrl: 'homePageView.line.template.html',
  styleUrls: ['homePageView.line.styles.scss']
})
export class HomePageLineComponent {
  @Input() type: number = 1;
}
