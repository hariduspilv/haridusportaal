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
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzEwNzc1NjgsImV4cCI6MTU3MTA4MTE2OCwiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoibmF0dXJhbF9wZXJzb24ifX0sInVzZXJuYW1lIjoiMzgyMDEyNDAzMTkiLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsfQ._bJkAYEBDmO-AJbN4wb2tPx87dfvmmeb8blZFuP7falJ2VWeYi0mtIo3DvDlBmTFDx48mhOrOFrkixUPHnzd0g';
  }
}
