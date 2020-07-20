import {
    Component,
    Input,
  } from '@angular/core';
@Component({
  selector: 'news',
  templateUrl: 'news.template.html',
})

  export class NewsComponent{
  @Input() list: Object[];

}
