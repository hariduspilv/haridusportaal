import {
  Component,
  Input,
  ElementRef,
  ContentChildren,
  OnInit,
  HostBinding,
} from '@angular/core';
import * as moment from 'moment';

export interface FormItemOption {
  key: 'string';
  value: 'string';
}

@Component({
  selector: 'formItem',
  templateUrl: 'formItem.template.html',
  styleUrls: ['formItem.styles.scss'],
})

export class FormItemComponent implements OnInit{
  @ContentChildren('#inputField') inputField: ElementRef;
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() options: FormItemOption[] = [];
  @HostBinding('class') get hostClasses(): string {
    return this.focused ? 'formItem formItem--focused' : 'formItem';
  }

  public field: string;
  public dateField;
  public dirty: boolean = false;
  public moveTitle: boolean = false;
  public focused: boolean = false;

  update(focus: boolean = false) {
    if (focus) {
      this.focused = true;
      this.moveTitle = true;
    } else {

      if (this.dateField && this.dateField.start) {
        console.log(this.dateField);
        this.field = this.dateField.start.format('DD.MM.YYYY');
      } else {
        this.field = '';
      }

      this.focused = false;
      this.dirty = true;
      this.moveTitle = this.field && this.field.length > 0 ? true : false;

    }
  }

  checkInitialValue(): void {
    if (this.type === 'select') {
      this.field = '';
    }
  }

  ngOnInit() {
    this.checkInitialValue();
  }
}
