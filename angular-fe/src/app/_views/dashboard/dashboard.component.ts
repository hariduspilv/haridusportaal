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
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzEwNjgxOTQsImV4cCI6MTU3MTA3MTc5NCwiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoibmF0dXJhbF9wZXJzb24ifX0sInVzZXJuYW1lIjoiMzgyMDEyNDAzMTkiLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsfQ.CNPiKmBd4KkrV0ZuqyRXVGUZhlrNRpgTWc47b4-ubNZYimmamJuLJkDFDr_k9TrNtGc1_vcoVnd8zXsJbn3nCQ';
  }
}
