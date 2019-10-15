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
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzExMjU4MDMsImV4cCI6MTU3MTEyOTQwMywiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoibmF0dXJhbF9wZXJzb24ifX0sInVzZXJuYW1lIjoiMzgyMDEyNDAzMTkiLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsfQ.QLOEOp9T3oZIxbDPo_Ft_kP7nrkJXbq-d8bK1FR4bRr1BkjHgjCw8HUkYEnOCJXKVKquJgEh3ZWaYdXjvrta2Q';
  }
}
