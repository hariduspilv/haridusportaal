import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { TitleService } from '@app/_services/TitleService';

interface BreadcrumbsItem {
  title: string;
  link: string;
}

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.template.html',
  styleUrls: ['./breadcrumbs.styles.scss'],
})

export class BreadcrumbsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public data: BreadcrumbsItem[] = [];
  @Input() public path: string = '';
  @Input() public ellipsis: boolean = true;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private titleService: TitleService,
  ) {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.path && changes.path.currentValue !== changes.path.previousValue) {
      this.getData();
    }
  }

  public ngOnInit() {
    if (this.path && this.path.length !== 0) {
      this.getData();
    } else {
      // tslint:disable-next-line: max-line-length
      this.titleService.setTitle(this.data[this.data.length - 1].title);
    }
  }

  public ngOnDestroy(): void {
    this.titleService.setTitle('');
  }

  private parseData(response): void {
    try {
      this.data = response.data.route.breadcrumb.map((item, i, arr) => {
        if (i === arr.length - 1) {
          this.titleService.setTitle(item.text);
        }
        return {
          title: item.text,
          link: item.url.path,
        };
      });
    } catch (err) {
      this.titleService.setTitle('');
    }
  }

  private getData(): void {
    const variables = {
      path: this.path,
    };
    const path = this.settings.query('getBreadcrumbs', variables);
    const subscription = this.http.get(path).subscribe((response) => {
      this.parseData(response);
    });
  }
}
