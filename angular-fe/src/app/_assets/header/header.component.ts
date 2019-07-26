import { Component, OnInit, HostBinding } from '@angular/core';
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
  @HostBinding('class') get hostClasses(): string {
    return 'header';
  }
  @HostBinding('attr.aria-label') ariaLabel:string = 'Päis';
  @HostBinding('attr.role') role:string = 'banner';

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
  }
}
