import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

  export class DashboardComponent implements OnInit{
  @Input() data: Object;
  @Input() applicationsData: Object;
  @Input() breadcrumbs: Object[];
  public linksLabel = 'links';

  constructor(
  ) {}

  ngOnInit() {
    this.data = FieldVaryService(this.data);
  }
}
