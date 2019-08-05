import { Component, Input } from '@angular/core';

interface BreadcrumbsItem {
  title: string;
  link: string;
}

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.template.html',
  styleUrls: ['./breadcrumbs.styles.scss'],
})

export class BreadcrumbsComponent {
  @Input() data: BreadcrumbsItem[] = [];
}
