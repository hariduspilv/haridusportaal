import {
  Component,
  Input,
  ElementRef,
  ContentChildren,
  OnInit,
  HostBinding,
  forwardRef,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import * as moment from 'moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RippleService } from '@app/_services';

export interface FormItemOption {
  key: 'string';
  value: 'string';
}

@Component({
  selector: 'formItem',
  templateUrl: 'formItem.template.html',
  styleUrls: [
    'formItem.styles.scss',
    'formItem.select.styles.scss',
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FormItemComponent),
    },
  ],
})

export class FormItemComponent implements ControlValueAccessor, OnInit, OnChanges{
  @ContentChildren('#inputField') inputField: ElementRef;
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() staticTitle: string;
  @Input() errorMessage: string = '';
  @Input() error: boolean = false;
  @Input() success: boolean = false;
  @Input() titleDisabled: boolean = false;
  @Input() height: number;
  @Input() options: FormItemOption[] = [];
  @HostBinding('class') get hostClasses(): string {
    const errorClass = this.error ? 'formItem--error' : '';
    const successClass = this.success ? 'formItem--success' : '';
    return this.focused ?
          `formItem formItem--focused formItem--${this.type} ${errorClass} ${successClass}` :
          `formItem formItem--${this.type} ${errorClass} ${successClass}`;
  }

  propagateChange = (_: any) => {};
  public field: string;
  public dateField;
  public dirty: boolean = false;
  public filledField: boolean = false;
  public focused: boolean = false;

  constructor(
    private el: ElementRef,
    private ripple: RippleService,
    private cdr: ChangeDetectorRef,
  ) {}

  animateRipple($event) {
    this.ripple.animate($event, 'dark');
  }

  dateString(dateField) {
    const day = dateField.day < 10 ? `0${dateField.day}` : dateField.day;
    const month = dateField.month < 10 ? `0${dateField.month}` : dateField.month;
    const year = dateField.year;
    return `${day}.${month}.${year}`;
  }

  focusField() {
    this.filledField = true;
    this.focused = true;
  }

  removeComma() {
    setTimeout(
      () => {
        const values = this.el.nativeElement.querySelectorAll('.ng-value');
        for (const item of values) {
          item.className = item.className.replace(/\slastItem/gi, '');
        }
        const lastValue = values[values.length - 1];
        if (lastValue) {
          lastValue.className = `${lastValue.className} lastItem`;
        }
      },
      0);

  }
  update(action: string = '') {

    if (this.type === 'multi-select') {
      this.removeComma();
    }
    if (action === 'datepicker') {
      if (this.dateField && this.dateField.year) {
        this.field = this.dateString(this.dateField);
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

            this.field = this.dateString(this.dateField);
          }
        }
      }

      if (action === 'blur') {
        this.focused = false;
      }

      this.dirty = true;

      if (this.type === 'select' || this.type === 'multi-select') {
        this.filledField = this.field.length > 0;
        if (this.focused) {
          this.filledField = true;
        }
      } else {
        this.filledField = this.field && (this.field.length > 0 || typeof this.field === 'object'
          || typeof this.field === 'number');
      }
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
    if (this.type === 'select' || this.type === 'multi-select') {
      this.field = '';
    }

    if (this.type === 'multi-select') {
      this.removeComma();
    }
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.checkInitialValue();
  }
}
