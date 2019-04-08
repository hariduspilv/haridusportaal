import { Component, Input } from '@angular/core';

@Component({
  selector: 'inline-articles',
  templateUrl: './inline.articles.html',
  styleUrls: ['./inline.articles.scss']
})

export class InlineArticlesComponent {
  @Input() heading: string = '';
  @Input() generalLink: object;
  @Input() content: object;
  @Input() contentLabels: Object;
 
  constructor(){}
  
}
