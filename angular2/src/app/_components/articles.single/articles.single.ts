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
  @Input() subtext: any;
  @Input() contentLeft: boolean;
  @Input() url: object;
  @Input() theme: string = '';

  subtextObject: boolean = false;

  constructor() {}

  ngOnInit() {
    if (this.subtext === Object(this.subtext)) {
      this.subtextObject = true;
    }
  }
}
