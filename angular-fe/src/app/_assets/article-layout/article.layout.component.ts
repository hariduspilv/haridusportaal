import { Component, Input, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'article-layout',
  templateUrl: './article.layout.template.html',
  styleUrls: ['./article.layout.styles.scss'],
})

export class ArticleLayout {
  @Input() sidebar: any = { entity: {} };
  @Input() feedbackNid: string = '';
  constructor(
  ) {}

}
