import { Component, OnInit } from '@angular/core';
import { SidemenuService } from '@app/_services';
import ModalService from '@app/_services/ModalService';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit {
  public active: boolean;

  constructor(
    private sidemenuService: SidemenuService,
    private modalService: ModalService,
  ) {}

  toggleSidemenu(): void {
    this.sidemenuService.toggle();
    this.active = this.sidemenuService.isVisible;
  }

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
  }
}
