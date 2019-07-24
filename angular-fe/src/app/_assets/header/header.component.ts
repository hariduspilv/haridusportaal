import { Component } from '@angular/core';
import ModalService from '@app/_services/ModalService';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent {
  public active: boolean = false;
  constructor(private modalService: ModalService) {}
}
