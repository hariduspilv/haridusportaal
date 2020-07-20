import { Component, Input } from '@angular/core';

@Component({
  selector: 'inline-articles',
  templateUrl: './inline-articles.component.html',
  styleUrls: ['./inline-articles.component.scss'],
})

export class InlineArticlesComponent {
  @Input() identifier: string = '';
  @Input() heading: string = '';
  @Input() generalLink: object;
  @Input() content: object;
  @Input() contentLabels: Object;
  @Input() theme: string = '';

  public subtextObject: boolean = false;
  public authorLabel: string = '';
  public dateLabel: string = '';
  constructor() {}
  ngOnInit() {
    if (
      this.contentLabels['subtext']
        && this.contentLabels['subtext'] === Object(this.contentLabels['subtext'])
    ) {
      this.authorLabel = this.contentLabels['subtext']['author'];
      this.dateLabel = this.contentLabels['subtext']['date'];
      this.subtextObject = true;
    }
  }
}
