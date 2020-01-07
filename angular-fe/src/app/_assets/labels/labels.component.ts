import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'labels',
  templateUrl: './labels.template.html',
  styleUrls: ['./labels.styles.scss'],
})

export class LabelsComponent {
  @Input() data: Object[];
  @Input() border: string = '#c7c7c9';
  @Input() background: string = '#ffffff';
  @Input() type: string;
  private childStyles = {
    border: `.0675rem solid ${this.border}`,
    background: this.background,
  };
  @HostBinding('attr.role') role:string = 'group';
  @HostBinding('class') get hostClasses(): string {
    return this.type;
  }
  ngOnChanges() {
    if (this.data) {
      this.data = this.data.map((item) => {
        if (item['entity']) {
          return item['entity'];
        }
        return item;
      });
      if (!this.type) {
        this.childStyles.border = `.0675rem solid ${this.border}`;
        this.childStyles.background = this.background;
      }
    }
  }
}
