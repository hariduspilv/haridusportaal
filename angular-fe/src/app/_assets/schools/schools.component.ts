import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
@Component({
  selector: 'schools',
  templateUrl: 'schools.template.html',
})

  export class SchoolsComponent implements OnInit{
  @Input() list: Object[];

  public objectKeys = Object.keys;

  constructor(
  ) {}

  ngOnInit() {
  }
}
