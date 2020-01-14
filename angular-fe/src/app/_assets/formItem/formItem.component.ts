import {
  Component,
  Input,
  Output,
  ElementRef,
  ContentChildren,
  OnInit,
  HostBinding,
  forwardRef,
  ChangeDetectorRef,
  EventEmitter,
  HostListener,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import * as moment from 'moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RippleService } from '@app/_services';
import conf from '@app/_core/conf';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TitleCasePipe } from '@app/_pipes/titleCase.pipe';
import { ParseInAddsPipe } from '@app/_pipes/parseInAdds.pipe';
import { QueryParamsService } from '@app/_services/QueryParams.service';

export interface FormItemOption {
  key: string;
  value: string;
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
    ParseInAddsPipe,
  ],
})

export class FormItemComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @ContentChildren('#inputField') inputField: ElementRef;
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() label: string = '';
  @Input() public value: string = '';
  @Input() staticTitle: string;
  @Input() errorMessage: string = '';
  @Input() error: boolean = false;
  @Input() success: boolean = false;
  @Input() titleDisabled: boolean = false;
  @Input() height: number;
  @Input() options: FormItemOption[] = [];
  @Input() pattern: any = false;
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Output() autoCompleteChanged: EventEmitter<any> = new EventEmitter();
  @Input() name: string = '';
  @Input() checked: string;
  @Input() query: string = '';
  @Input() disabled: boolean;
  @Input() valueType: string = 'string';
  @Input() browserAutocomplete: string = '';
  @Input() sortOptions: boolean = true;
  @Input() search: boolean = true;
  @Input() appendTo: string = '';

  @HostBinding('class') get hostClasses(): string {
    const classes = ['formItem', `formItem--${this.type}`];
    if (this.error) {
      classes.push('formItem--error');
    }
    if (this.success) {
      classes.push('formItem--success');
    }
    if (this.titleDisabled) {
      classes.push('formItem--titleDisabled');
    }
    if (this.disabled) {
      classes.push('formItem--disabled');
    }

    return this.focused ?
      `formItem--focused ${classes.join(' ')}` :
      `${classes.join(' ')}`;
  }

  propagateChange = (_: any) => { };
  public field: any;
  public dateField;
  public dirty: boolean = false;
  public filledField: any = false;
  public focused: boolean = false;
  public patterns: Object;
  public isMobile: boolean;

  constructor(
    private el: ElementRef,
    private ripple: RippleService,
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceDetectorService,
    private inAddsPipe: ParseInAddsPipe,
    private queryParams: QueryParamsService,
  ) {
    this.patterns = conf.patterns;
    this.isMobile = !this.deviceService.isDesktop();
  }

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
        const values = this.el.nativeElement.querySelectorAll('.ng-value-label');
        const valuesArray = [];
        for (const item of values) {
          valuesArray.push(item.innerText || item.textContent);
        }

        const valuesText = valuesArray.join(', ');
        let textContainer = this.el.nativeElement.querySelector('.ng-value-text-child');
        if (!textContainer) {
          try {
            const mainContainer = this.el.nativeElement.querySelector('.ng-value-container');
            const firstChild = this.el.nativeElement.querySelector('.ng-placeholder');
            const textContainerEl = document.createElement('span');
            textContainerEl.className = 'ng-value-text';

            const textContainerChildEl = document.createElement('span');
            textContainerChildEl.className = 'ng-value-text-child';
            textContainerEl.appendChild(textContainerChildEl);
            mainContainer.insertBefore(textContainerEl, firstChild);
            textContainer = this.el.nativeElement.querySelector('.ng-value-text-child');
          } catch (err) { }
        }

        try {
          textContainer.innerHTML = valuesText;
        } catch (err) { }

        this.detectChanges();
      },
      0);

  }
  update(action: string = '', elem = undefined) {

    if (action === 'datepicker') {
      if (this.dateField && this.dateField.year) {
        this.field = this.dateString(this.dateField);
      }
    }

    if (action === 'focus') {
      this.focused = true;
      this.filledField = true;
    } else {

      if (action === 'blur') {
        if (elem) {
          setTimeout(
            () => {
              elem.close();
              this.focused = false;
            },
            120);
        } else {
          this.focused = false;
        }
        if (this.pattern) {
          const input = this.el.nativeElement.querySelector('input');
          this.error = input.classList.contains('ng-invalid');
        }
        if (this.type === 'select' || this.type === 'multi-select') {
          this.onChange.emit();
        }
      }

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

      if (this.type === 'checkbox' && !action && this.field !== '') {
        this.onChange.emit(this.field);
      }

      this.dirty = true;

      if (this.type === 'select' || this.type === 'multi-select') {
        if (this.type === 'multi-select' && !this.field) {
          this.field = [];
        }
        this.filledField = this.field.length > 0;

        if (typeof this.field === 'number') {
          this.filledField = true;
        }

        if (this.focused) {
          this.filledField = true;
        }

      } else {
        this.filledField = this.field && (this.field.length > 0 || typeof this.field === 'object')
          || (typeof this.field === 'number' && (this.field || this.field === 0));
      }

    }
    if (this.type !== 'autocomplete') {
      this.propagateChange(this.field);
    }

    if (this.type === 'multi-select') {
      this.removeComma();
    }

    if (this.type === 'autocomplete' && !this.field.addressHumanReadable &&
      !this.field.ipikkaadress && this.query === 'inaadress') {
      if (typeof this.field !== 'string') {
        this.field = this.undefinedAddressValue();
      }
      this.propagateChange(this.field);
    }

    this.detectChanges();
  }

  detectChanges() {
    if (!this.cdr['destroyed']) {
      this.cdr.detectChanges();
    }
  }

  undefinedAddressValue() {
    return {
      adr_id: undefined,
      ads_oid: undefined,
      seqNo: undefined,
      klElukoht: undefined,
      adsId: undefined,
      adsOid: undefined,
      addressFull: undefined,
      addressCoded: undefined,
      county: undefined,
      countyEHAK: undefined,
      localGovernment: undefined,
      localGovernmentEHAK: undefined,
      settlementUnit: undefined,
      settlementUnitEHAK: undefined,
      address: undefined,
      apartment: undefined,
      addressHumanReadable: undefined,
    };
  }

  autocompleteUpdate(value: any = ''): void {

    if (this.valueType === 'string') {
      this.field = value === '' ? this.field : value;
    } else {

      if (typeof value !== 'string') {

        if (!value.addressHumanReadable) {
          if (value.kort_nr) {
            value.addressHumanReadable = `${value.pikkaadress}-${value.kort_nr}`;
          } else {
            value.addressHumanReadable = value.pikkaadress;
          }
          value.seqNo = value.unik;
        }

        if (value['unik'] && value['pikkaadress']) {
          this.field = {
            seqNo: value['unik'],
            klElukoht: value['ehak'],
            adr_id: value['adr_id'],
            ads_oid: value['ads_oid'],
            adsId: value['adr_id'],
            adsOid: value['ads_oid'],
            addressFull: value['pikkaadress'],
            addressCoded: value['koodaadress'],
            county: value['maakond'],
            countyEHAK: value['ehakmk'],
            localGovernment: value['omavalitsus'],
            localGovernmentEHAK: value['ehakov'],
            settlementUnit: value['asustusyksus'],
            settlementUnitEHAK: value['ehak'],
            address: value['aadresstekst'],
            apartment: value['kort_nr'],
            addressHumanReadable: value['addressHumanReadable'],
          };
        }
      }
    }

    this.autoCompleteChanged.emit(this.field);
    this.propagateChange(this.field);
  }

  writeValue(value: string) {
    if (this.type === 'multi-select') {

      if (value) {
        this.field = value;
      }
      if (this.field === '' || !this.field) {
        this.field = false;
      }
      if (typeof this.field !== 'object' && this.field !== '' && this.field) {
        this.field = [this.field];
      }
      if (this.options) {
        try {
          const arrType = typeof this.options[0].value;
          if (arrType === 'string') {
            this.field = this.field.map((item) => {
              if (item) {
                return item.toString();
              }
            });
          }
        } catch (err) { }
      }
    } else if (this.type === 'date') {
      this.dateField = value || this.field;
    } else {
      this.field = value || '';
    }

    if (this.field === 'null') {
      this.field = '';
    }

    if (this.field
      && typeof this.field !== 'object'
      && !this.field.toString().match(/\D/)
      && this.type !== 'date'
    ) {
      this.field = parseFloat(this.field);
    }

    if (this.type === 'autocomplete' && value) {
      this.autocompleteUpdate(value);
    }

    this.update('blur');
    this.propagateChange(this.field);
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {

  }

  checkInitialValue(): void {
    this.checkDisabled();

    if (this.name) {
      this.field = this.queryParams.getValues(this.name) || this.field;
    }
    if (this.type === 'select' || this.type === 'multi-select') {
      // this.field = '';
      if (this.options) {
        this.options = this.options.map((opt) => {
          return typeof opt === 'string' ? {
            key: new TitleCasePipe().transform(opt),
            value: opt,
          } : opt;
        });
      }
    } else if (this.type === 'checkbox') {
      if (this.checked === '' || this.checked === 'checked') {
        this.field = 'true';
      }
    }

    if (this.type === 'multi-select') {
      this.removeComma();
      if (this.field && this.field.length) {
        this.filledField = true;
      }
      if (this.field && typeof this.field !== 'object') {
        this.field = this.field.toString().split(';');
      }
    } else {
      if (this.value) {
        this.field = this.value;
        this.filledField = true;
      }
    }

    if (this.field
      && typeof this.field !== 'object'
      && !this.field.match(/\D/)
      && this.type !== 'date') {
      this.field = parseFloat(this.field);
    }

    if (this.options) {
      try {
        const arrType = this.options[0] ? typeof this.options[0].value : 'string';
        if (arrType === 'string') {
          this.field = this.field.map((item) => {
            if (item) {
              return item.toString();
            }
          });
        } else if (arrType === 'number') {
          this.field = this.field.map((item) => {
            if (item) {
              return parseFloat(item);
            }
          });
        }
      } catch (err) {

      }
    }

    this.detectChanges();
  }

  checkDisabled(): void {

    if (typeof this.disabled === 'string') {
      this.disabled = this.disabled === 'true' ? true : undefined;
    } else {
      this.disabled = !this.disabled ? undefined : this.disabled;
    }
    this.detectChanges();
  }

  triggerOnUpdate(): void {
    this.onUpdate.emit(true);
  }

  getValue() {
    return {
      name: this.name,
      value: this.field,
      search: this.search,
    };
  }

  setValue(value) {
    this.writeValue(value);
  }

  ngOnChanges() {
    this.checkInitialValue();
    this.checkDisabled();
    this.detectChanges();
  }

  ngOnInit() {
    this.checkInitialValue();
  }
  ngOnDestroy(): void {
    this.cdr.detach();
  }
}
