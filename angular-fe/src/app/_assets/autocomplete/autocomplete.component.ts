import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { map } from 'rxjs/operators';
import { AddressService } from '@app/_services/AddressService';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'autocomplete',
  templateUrl: 'autocomplete.template.html',
  styleUrls: ['autocomplete.styles.scss'],
  host: {
    class: 'autocomplete',
  },
})

export class AutocompleteComponent implements OnDestroy {
  @Input() type: string = '';
  @Input() valueType: string = 'string';
  public data: [] = [];
  public active: boolean = false;
  public loading: boolean = false;
  public activeItem: number = -1;
  @Output() onValueSelected: EventEmitter<any> = new EventEmitter;
  private debounce;
  private delay: number = 300;
  private subscription: Subscription;
  private minChars: number = 3;
  private searched = false;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private liveAnnouncer: LiveAnnouncer,
    private addressService: AddressService,
    private translateService: TranslateService,
  ) {
  }

  public search(value: string = '', $event: any = false): void {
    if (this.active && ($event.key === 'ArrowUp' || $event.key === 'ArrowDown')) {
      this.navigate($event.key);
    } else if ($event.key === 'Enter') {
      $event.stopPropagation();
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
            this.liveAnnouncer.announce(this.translateService.get('autocomplete.loading'));

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
              }, () => {
              }, () => {
                this.searched = true;
                this.loading = false;
                this.subscription.unsubscribe();
                this.data.length
                  ? this.liveAnnouncer.announce(
                  this.translateService.get('wcag.address_suggestions_opened'))
                  : this.liveAnnouncer.announce(
                  this.translateService.get('autocomplete.no_result'));
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
                this.data.length
                  ? this.liveAnnouncer.announce(
                    this.translateService.get('wcag.suggestions_opened'))
                  : this.liveAnnouncer.announce(
                  this.translateService.get('autocomplete.no_result'));
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

  ngOnDestroy() {
    this.unbindScroll();
  }

  private parseInAds(data) {
    let resultSet = data || [];
    resultSet = resultSet.filter(address => (address.kood6 !== '0000' || address.kood7 !== '0000'));
    try {
      resultSet.forEach((address, index) => {
        resultSet[index] = this.addressService.inAdsFormatValue(address);
      });

      if (this.valueType === 'string') {
        resultSet = resultSet.map((item) => {
          return item.addressHumanReadable;
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
          } catch (err) {
          }
        },
        0);
    }
  }

  private chooseOption(value: any = false): void {
    if (this.activeItem || this.activeItem === 0) {
      this.onValueSelected.emit(this.data[this.activeItem]);
    } else {
      this.onValueSelected.emit(value);
    }
    this.close(true);
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
