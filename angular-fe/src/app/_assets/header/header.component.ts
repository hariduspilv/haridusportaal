import { Component } from '@angular/core';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent {
  public active: boolean = false;
}
