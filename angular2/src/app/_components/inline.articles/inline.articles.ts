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
  @Input() theme: string = '';

  public subtextObject: boolean = false;
  public authorLabel: string = '';
  public dateLabel: string = '';
 
  constructor(){}
  
  ngOnInit() {
    const { contentLabels } = this;
    if (contentLabels['subtext'] && contentLabels['subtext'] === Object(contentLabels['subtext'])) {
      this.authorLabel = contentLabels['subtext']['author'];
      this.dateLabel = contentLabels['subtext']['date'];
      this.subtextObject = true;
    }
  }
}
