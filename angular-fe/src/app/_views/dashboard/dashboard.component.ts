import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

  export class DashboardComponent implements OnInit{
  @Input() breadcrumbs: Object[];
  @Input() jwt;

  public linksLabel = 'links';

  constructor() {}

  ngOnInit() {
  }
}
