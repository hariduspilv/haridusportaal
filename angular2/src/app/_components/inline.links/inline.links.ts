import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'inline-links',
  templateUrl: './inline.links.html',
  styleUrls: ['./inline.links.scss']
})

export class InlineLinksComponent {
  @Input() content: Array<object>;
  @Input() contentLabels: object;
  @Input() externalImage: object;
  @Input() externalLink: string;
  @Input() columnLayout: boolean;

  constructor(public translate: TranslateService) {}
   
  ngOnInit() {
    const { content, contentLabels, externalImage, externalLink } = this;
    if (content && content.length && externalImage && externalImage['standard'] && !contentLabels['image']) {
      contentLabels['image'] = 'image';
      content.forEach(elem => elem['image'] = externalImage);
    }
    if (content && content.length && externalLink && !contentLabels['link']) {
      contentLabels['link'] = 'link';
      content.forEach(elem => elem['link'] = elem['fieldTopicLink'] ? this.translate.get(externalLink)['value'] : null);
    }
  }

  imgModifier(element, index, img) {
    const elem = document.getElementById(`${element}-${index}`);
    const { externalImage, content, contentLabels } = this;
    if (externalImage) {
      elem.setAttribute('src', externalImage[img]);
    } else {
      elem.setAttribute('src', content[index][contentLabels['image']][img]);
    }
  }
  
}
