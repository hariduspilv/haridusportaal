import { Component, Input, HostBinding, OnInit } from '@angular/core';
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
  @Input() data: Object[];
  @Input() facts: Object;
  private collection: SidebarType = collection;
  private keys: string[];
  private mappedData: any[];
  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }
  constructor(private sidebarService: SidebarService) {}
  ngOnInit() {
    this.mappedData = this.sidebarService.mapUniformKeys(this.data, this.facts);
    this.keys = Object.keys(this.mappedData);
  }
}
// Subcomponents
@Component({
  selector: 'sidebar-links',
  templateUrl: './templates/sidebar.links.template.html',
})
export class SidebarLinksComponent {
  @Input() data: Object[];
}

@Component({
  selector: 'sidebar-categories',
  templateUrl: './templates/sidebar.categories.template.html',
})
export class SidebarCategoriesComponent implements OnInit {
  @Input() data: Object[];
  private entriesData: any[];
  ngOnInit() {
    this.entriesData = Object.entries(this.data);
  }
}
@Component({
  selector: 'sidebar-contact',
  templateUrl: './templates/sidebar.contact.template.html',
})
export class SidebarContactComponent {
  @Input() data: Object[];
}

@Component({
  selector: 'sidebar-articles',
  templateUrl: './templates/sidebar.articles.template.html',
})
export class SidebarArticlesComponent {
  @Input() data: {};
}

@Component({
  selector: 'sidebar-data',
  template: '<div>{{ data.entity.fieldAdditionalBody }}<div>',
})
export class SidebarDataComponent {
  @Input() data: {};
}

@Component({
  selector: 'sidebar-actions',
  templateUrl: './templates/sidebar.actions.template.html',
})
export class SidebarActionsComponent {
  @Input() data: Object[];
}
@Component({
  selector: 'sidebar-location',
  templateUrl: './templates/sidebar.location.template.html',
})
export class SidebarLocationComponent {
  @Input() data: Object[];
}

@Component({
  selector: 'sidebar-facts',
  templateUrl: './templates/sidebar.facts.template.html',
})
export class SidebarFactsComponent {
  @Input() data: Object[];
  private graduatesToJobsValues = [
    { class: 'first with-bg', text: 'oska.more_graduates' },
    { class: 'first with-bg', text: 'oska.less_graduates' },
    { class: 'second with-bg', text: 'oska.enough_graduates' },
    { class: 'third with-bg', text: 'oska.graduates_work_outside_field' },
    { class: 'fourth with-bg', text: 'oska.no_graduates' },
  ];
  private trendingValues = [
    { icon: 'arrow-up', class: 'second', text: 'oska.big_increase' },
    { icon: 'arrow-up-right', class: 'second', text: 'oska.increase' },
    { icon: 'arrow-right', class: 'third', text: 'oska.stagnant' },
    { icon: 'arrow-down-right', class: 'first', text: 'oska.decline' },
    { icon: 'arrow-down', class: 'first', text: 'oska.big_decline' },
  ];
  arrayOfLength (len) {
    return Array(parseInt(len, 10)).fill(0).map((x, i) => i);
  }
}
