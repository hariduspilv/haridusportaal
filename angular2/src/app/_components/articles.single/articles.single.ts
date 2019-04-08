import { Component, Input } from '@angular/core';

@Component({
  selector: 'articles-single',
  templateUrl: './articles.single.html',
  styleUrls: ['./articles.single.scss']
})

export class ArticlesSingleComponent {
  @Input() image: object;
  @Input() heading: string = '';
  @Input() title: string = '';
  @Input() subtext: string = '';
  @Input() contentLeft: boolean;
  @Input() url: object;

  constructor() {}

}
