import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'inline-links',
  templateUrl: './inline.links.html',
  styleUrls: ['./inline.links.scss']
})

export class InlineLinksComponent {
  @Input() content: Array<object>;
  @Input() contentLabels: object;
  @Input() externalImage: object;

  constructor() {}
   
  ngOnInit() {
    const { content, contentLabels, externalImage } = this;
    if (content && content.length && externalImage && externalImage['standard'] && !contentLabels['image']) {
      contentLabels['image'] = 'image';
      content.forEach(elem => elem['image'] = externalImage);
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
