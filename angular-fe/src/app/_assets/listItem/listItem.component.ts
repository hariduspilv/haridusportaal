import {
    Component,
    OnInit
  } from '@angular/core';
  
  export interface ListItemInterface {
    'firstname': string;
  }
  
  @Component({
    selector: 'listItem',
    templateUrl: 'listItem.template.html',
    styleUrls: ['listItem.styles.scss']
  })
  
  export class ListItemComponent implements OnInit{
  
    constructor(
    ) {}
  
    ngOnInit() {
    }
  }
  