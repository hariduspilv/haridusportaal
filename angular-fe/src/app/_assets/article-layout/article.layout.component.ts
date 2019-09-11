import { Component, Input } from '@angular/core';

@Component({
  selector: 'article-layout',
  templateUrl: './article.layout.template.html',
  styleUrls: ['./article.layout.styles.scss'],
})

export class ArticleLayout {
  @Input() sidebar: any = { entity: {} };
  constructor() {}
}
