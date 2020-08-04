import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  templateUrl: './documentCheckView.template.html',
  styleUrls: ['documentCheckView.styles.scss'],
})
export class DocumentCheckViewComponent {
  public path = this.location.path();
  constructor(
    private location: Location,
  ) { }
}
