import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
@Component({
  selector: 'news',
  templateUrl: 'news.template.html',
})

  export class NewsComponent implements OnInit{
  @Input() list: Object[];
  
  constructor(
  ) {}

  ngOnInit() {
  }
}
