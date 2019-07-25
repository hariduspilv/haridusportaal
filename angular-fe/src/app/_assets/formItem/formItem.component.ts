import {
  Component,
  Input,
  ElementRef,
  ContentChildren,
  OnInit,
  HostBinding,
  forwardRef,
} from '@angular/core';
import * as moment from 'moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FormItemOption {
  key: 'string';
  value: 'string';
}

@Component({
  selector: 'formItem',
  templateUrl: 'formItem.template.html',
  styleUrls: ['formItem.styles.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FormItemComponent),
    },
  ],
})

export class FormItemComponent implements ControlValueAccessor, OnInit{
  @ContentChildren('#inputField') inputField: ElementRef;
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() options: FormItemOption[] = [];
  @HostBinding('class') get hostClasses(): string {
    return this.focused ? 'formItem formItem--focused' : 'formItem';
  }

  propagateChange = (_: any) => {};
  public field: string;
  public dateField;
  public dirty: boolean = false;
  public filledField: boolean = false;
  public focused: boolean = false;

  constructor(
    private el: ElementRef,
  ) {}

  update(action: string = '') {

    if (action === 'datepicker') {
      if (this.dateField && this.dateField.year) {
        const day = this.dateField.day < 10 ? `0${this.dateField.day}` : this.dateField.day;
        const month = this.dateField.month < 10 ? `0${this.dateField.month}` : this.dateField.month;
        const year = this.dateField.year;
        this.field = `${day}.${month}.${year}`;
      }
    }

    if (action === 'focus') {
      this.focused = true;
      this.filledField = true;
    } else {

      if (this.type === 'date') {
        if (typeof this.dateField === 'string') {
          this.field = this.dateField;
        }
        if (!this.dateField) {
          this.dateField = '';
          this.field = '';
        } else {
          const dateObj = moment(this.field, 'DD.MM.YYYY');
          if (dateObj.isValid()) {
            this.dateField = {
              year: dateObj.year(),
              month: dateObj.month() + 1,
              day: dateObj.date(),
            };
          }
        }
      }

      this.focused = false;
      this.dirty = true;
      this.filledField = this.field && (this.field.length > 0 || typeof this.field === 'object');
    }
    this.propagateChange(this.field);
  }

  writeValue(value: string) {
    this.field = value || '';
    this.update();
    this.propagateChange(this.field);
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {

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
