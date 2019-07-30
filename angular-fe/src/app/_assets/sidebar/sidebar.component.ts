import { Component, Input, HostBinding, OnInit} from '@angular/core';
import { SidebarService } from '@app/_services';
import { collection } from './helpers/sidebar';

interface SidebarType {
  [key: string]: string;
}

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.template.html',
  styleUrls: ['./sidebar.styles.scss'],
})
export class SidebarComponent {
  @Input() keys: string[];
  @Input() data: Object[];
  private collection: SidebarType = collection;
  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }
  constructor(private sidebarService: SidebarService) {}
  ngOnInit() {
    this.data = this.sidebarService.mapUniformKeys(this.data);
  }
}
// Subcomponents
@Component({
  selector: 'sidebar-links',
  templateUrl: './templates/sidebar.links/sidebar.links.template.html',
})
export class SidebarLinksComponent {
  @Input() data: Object[];
}

@Component({
  selector: 'sidebar-categories',
  templateUrl: './templates/sidebar.categories/sidebar.categories.template.html',
})
export class SidebarCategoriesComponent implements OnInit {
  @Input() data: Object[];
  ngOnInit() {
    this.data = Object.entries(this.data);
  }
}
