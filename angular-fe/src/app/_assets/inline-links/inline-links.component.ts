import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';


@Component({
  selector: 'inline-links',
  templateUrl: './inline-links.component.html',
  styleUrls: ['./inline-links.component.scss'],
})

export class InlineLinksComponent implements OnInit {
  @Input() identifier: string;
  @Input() content: Object[];
  @Input() contentLabels: object;
  @Input() externalImage: object;
  @Input() externalLink: string;
  @Input() columnLayout: boolean;
  @Input() hoverEffect: boolean;
  @Input() extraSpaced: boolean;

  public imageState: string = 'standard';

  constructor(public translate: TranslateService) {}
  ngOnInit() {
    this.imageState = window.innerWidth <= 1024 ? 'hover' : this.imageState;
    if (this.content
      && this.content.length && this.externalImage
      && this.externalImage['standard'] && !this.contentLabels['image']) {
      this.contentLabels['image'] = 'image';
      this.content.forEach(elem => elem['image'] = this.externalImage);
    }
    if (this.content && this.content.length && this.externalLink && !this.contentLabels['link']) {
      this.contentLabels['link'] = 'link';
      this.content.forEach(
        (elem: any) => {
          elem['link'] = elem['fieldTopicLink']
          ? this.translate.get(this.externalLink)
          : null;
        },
      );
    }
  }

  imgModifier(element, index, img) {
    const elem = document.getElementById(`${element}-${this.identifier}-${index}`);
    if (this.externalImage) {
      elem.setAttribute('src', this.externalImage[img]);
    } else {
      elem.setAttribute('src', this.content[index][this.contentLabels['image']][img]);
    }
  }
}
