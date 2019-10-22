import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { SidemenuService, ModalService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit {
  public active: boolean;
  @Input() loginStatus: boolean = false;
  @Input() user: string = '';
  public search;
  constructor(
    private sidemenuService: SidemenuService,
    public modalService: ModalService,
    private translate: TranslateService,
  ) {}

  toggleSidemenu(): void {
    this.sidemenuService.toggle();
    this.active = this.sidemenuService.isVisible;
  }
  @HostBinding('class') get hostClasses(): string {
    return 'header';
  }
  @HostBinding('attr.aria-label') ariaLabel:string = this.translate.get('frontpage.header');
  @HostBinding('attr.role') role:string = 'banner';

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
  }
}
