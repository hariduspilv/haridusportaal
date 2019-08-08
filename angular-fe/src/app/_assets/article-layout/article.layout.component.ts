import { Component } from '@angular/core';
import { data } from '../../../../stories/assets/sidebar/sidebar.data';

@Component({
  selector: 'article-layout',
  templateUrl: './article.layout.template.html',
  styleUrls: ['./article.layout.styles.scss'],
})

export class ArticleLayout {
  constructor() {}
  private sidebar: any = data;
}
