import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

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
  private debounce;
  private delay: number = 300;
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
  ) {}

  public search(value: string = '', $event: any = false): void {

    if (this.active && ($event.key === 'ArrowUp' || $event.key === 'ArrowDown')) {
      this.navigate($event.key);
    } else if ($event.key === 'Enter') {
      this.chooseOption();
    } else {

      this.activeItem = -1;
      this.active = true;
      const variables = {
        search_term: value,
      };
      let path = this.settings.query(this.type, variables);

      if (this.type === 'inaadress') {
        const params = `ihist=1&appartment=1&address=${value}&results=10&callback=JSONP_CALLBACK`;
        path = `http://inaadress.maaamet.ee/inaadress/gazetteer?${params}`;
      }

      clearTimeout(this.debounce);
      this.debounce = setTimeout(
        () => {
          if (value.length >= this.minChars) {
            this.loading = true;
            if (this.type === 'inaadress') {
              this.subscription = this.http.jsonp(path, 'callback').subscribe((response) => {
                this.parseInAds(response);
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
    let resultSet = data['addresses'] || [];
    resultSet = resultSet.filter(address => (address.kood6 !== '0000' || address.kood7 !== '0000'));
    try {
      console.log(resultSet);
      resultSet.forEach((address) => {
        if (address.kort_nr) {
          address.addressHumanReadable = `${address.pikkaadress}-${address.kort_nr}`;
        } else {
          address.addressHumanReadable = address.pikkaadress;
        }
      });
      resultSet = resultSet.map((item) => {
        return item.ipikkaadress;
      });
    } catch (err) {
      console.log(err);
    }

    this.data = resultSet;
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

  private chooseOption(): void {
    this.onValueSelected.emit(this.data[this.activeItem]);
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
        this.subscription.unsubscribe();
      },
      delay);
  }

  public onClick(value: string = ''): void {
    this.onValueSelected.emit(value);
  }
}
