import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbRadio } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';

@Component({
  selector: 'autocomplete',
  templateUrl: 'autocomplete.template.html',
  styleUrls: ['autocomplete.styles.scss'],
  host: {
    class: 'autocomplete',
  },
})

export class AutocompleteComponent {
  @Input() type: string = '';
  @Input() valueType: string = 'string';

  private debounce;
  private delay: number = 500;
  public data:[] = [];
  public active: boolean = false;
  public loading: boolean = false;
  private subscription: Subscription;
  private minChars: number = 3;
  private searched = false;
  public activeItem: number = -1;

  @Output() onValueSelected: EventEmitter<any> = new EventEmitter;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  public search(value: string = '', $event: any = false): void {
    if (this.active && ($event.key === 'ArrowUp' || $event.key === 'ArrowDown')) {
      this.navigate($event.key);
    } else if ($event.key === 'Enter') {
      this.chooseOption(value);
    } else {

      this.activeItem = -1;
      this.active = true;
      const variables = {
        search_term: value,
      };
      const path = this.settings.query(this.type, variables);
      let params: HttpParams = new HttpParams();
      if (this.type === 'inaadress') {
        params = params.set('address', value);
        params = params.set('ihist', '1');
        params = params.set('appartment', '1');
        params = params.set('results', '10');
      }

      clearTimeout(this.debounce);
      if (this.subscription) this.subscription.unsubscribe();
      this.debounce = setTimeout(
        () => {
          if (value.length >= this.minChars) {
            this.loading = true;
            if (this.type === 'inaadress') {
              const jsonP = this.http.jsonp<any>(
                `https://inaadress.maaamet.ee/inaadress/gazetteer?${params.toString()}`,
                'callback',
              );
              this.subscription = jsonP.pipe(
                map((data) => {
                  return data.addresses;
                }),
              ).subscribe((response) => {
                this.parseInAds(response);
                this.positionElement();
              },          () => {}, () => {
                this.searched = true;
                this.loading = false;
                this.subscription.unsubscribe();
              });
            } else {
              this.subscription = this.http.get(path).subscribe((response) => {
                try {
                  this.data = response['data']['CustomElasticAutocompleteQuery'].map((item) => {
                    return item.Suggestion;
                  });
                } catch (err) {
                  this.data = [];
                }
                this.searched = true;
                this.loading = false;
                this.positionElement();
                this.subscription.unsubscribe();
              });
            }
          } else {
            this.searched = false;
            this.data = [];
          }
        },
        this.delay);
    }
  }

  private parseInAds(data) {
    let resultSet = data || [];
    resultSet = resultSet.filter(address => (address.kood6 !== '0000' || address.kood7 !== '0000'));
    try {
      resultSet.forEach((address) => {
        if (address.kort_nr) {
          address.addressHumanReadable = `${address.pikkaadress}-${address.kort_nr}`;
        } else {
          address.addressHumanReadable = address.pikkaadress;
        }
        address.seqNo = address.unik;
      });

      if (this.valueType === 'string') {
        resultSet = resultSet.map((item) => {
          return item.ipikkaadress;
        });
      }
    } catch (err) {
      console.log(err);
    }

    this.data = resultSet;
    this.cdr.detectChanges();
  }

  private navigate(direction: string = ''): void {
    if (this.data.length) {
      if (direction === 'ArrowUp') {
        this.activeItem -= 1;
      } else {
        this.activeItem += 1;
      }

      if (this.activeItem < 0) {
        this.activeItem = this.data.length - 1;
      } else if (this.activeItem >= this.data.length) {
        this.activeItem = 0;
      }

      setTimeout(
        () => {
          try {
            this.el.nativeElement.querySelector('.autocomplete__active').scrollIntoView();
          } catch (err) {}
        },
        0);
    }
  }

  private chooseOption(value: any = false): void {
    if (!this.activeItem) {
      this.onValueSelected.emit(this.data[this.activeItem]);
    } else {
      this.onValueSelected.emit(value);
    }
    this.close(true);
  }

  public close(noDelay: boolean = false): void {
    const delay = noDelay ? 0 : 200;
    setTimeout(
      () => {
        this.active = false;
        this.loading = false;
        this.activeItem = -1;
        this.data = [];
        this.searched = false;
        clearTimeout(this.debounce);
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        this.unbindScroll();
      },
      delay);
  }

  public onClick(value: string = ''): void {
    this.onValueSelected.emit(value);
  }

  private handleScroll() {
    const el = <HTMLElement>document.getElementById('autocomplete-block');
    const parent = <HTMLElement>el.parentNode;
    const parentHeight = parent.getBoundingClientRect().height;
    const scrollTop = (window.pageYOffset || document.documentElement.scrollTop);
    const parentTop = parent.getBoundingClientRect().top + scrollTop + parentHeight;
    const parentLeft = parent.getBoundingClientRect().left;
    const parentWidth = parent.getBoundingClientRect().width;
    el.style.top = `${parentTop}px`;
    el.style.left = `${parentLeft}px`;
    el.style.width = `${parentWidth}px`;
    el.style.opacity = '1';
  }

  private positionElement() {
    this.el.nativeElement.id = 'autocomplete-block';
    document.addEventListener('scroll', this.handleScroll, true);
    this.handleScroll();
  }

  private unbindScroll() {
    this.el.nativeElement.id = '';
    this.el.nativeElement.opacity = '0';
    document.removeEventListener('scroll', this.handleScroll, true);
  }

}
