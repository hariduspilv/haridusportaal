import { Component, Input } from '@angular/core';

@Component({
  selector: 'base-layout',
  templateUrl: './baseLayout.template.html',
  styleUrls: ['./baseLayout.styles.scss'],
})

export class BaseLayout {
  @Input() withMargins: boolean;
  constructor() {}
}
