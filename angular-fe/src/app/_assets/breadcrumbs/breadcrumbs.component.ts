import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

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
    private titleService: Title,
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
      this.titleService.setTitle(`${this.data[this.data.length - 1].title} | Haridusportaal edu.ee`);
    }
  }

  public ngOnDestroy(): void {
    this.titleService.setTitle('Haridusportaal edu.ee');
  }

  private parseData(response): void {
    try {
      this.data = response.data.route.breadcrumb.map((item, i, arr) => {
        if (i === arr.length - 1) {
          this.titleService.setTitle(`${item.text} | Haridusportaal.edu.ee`);
        }
        return {
          title: item.text,
          link: item.url.path,
        };
      });
    } catch (err) {
      this.titleService.setTitle('Haridusportaal edu.ee');
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
