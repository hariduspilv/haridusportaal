import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'labels',
  templateUrl: './labels.template.html',
  styleUrls: ['./labels.styles.scss'],
})

export class LabelsComponent {
  @Input() data: Object[];
  @Input() border: string = '#c7c7c9';
  @Input() background: string = '#eeeeee';
  private childStyles = {
    border: `.0675rem solid ${this.border}`,
    background: this.background,
  };
  @HostBinding('attr.role') role:string = 'group';
  ngOnChanges() {
    this.data = this.data.map((item) => {
      if (item['entity']) {
        return item['entity'];
      }
      return item;
    });
    this.childStyles.border = `.0675rem solid ${this.border}`;
    this.childStyles.background = this.background;
  }
}
