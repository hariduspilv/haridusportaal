import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'links',
  templateUrl: 'links.template.html',
  styleUrls: ['links.styles.scss'],
  host: {
    class: 'links',
  },
})

export class LinksComponent implements OnInit {
  @Input() data;
  @Input() type: string = 'external';

  ngOnInit() {
    if (this.type === 'document') {
      try {
        this.data = this.data.map((item) => {
          let output;
          if (item.entity.fieldAttachment && item.entity.fieldAttachment.entity) {
            output = {
              entity: {
                url: item.entity.fieldAttachment.entity.url,
              },
              description: item.entity.fieldName,
            };
          } else {
            output = item;
          }
          return output;
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      
    }
  }
}
