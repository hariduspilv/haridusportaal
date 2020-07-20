import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'newsList-view',
  templateUrl: 'newsListView.template.html',
  styleUrls: ['newsListView.styles.scss'],
})

export class NewsListViewComponent implements AfterViewInit {
  @Input() path: string;
  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  searchTitle: any;
  filterFull = false;
  private activatedFilters: boolean = false;
  public showFilter = true;
  public breadcrumbs = [
    {
      link: '/',
      title: 'Avaleht',
    },
    {
      link: '',
      title: 'Uudised',
    },
  ];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  toggleFilters(): void {
    const filters = Object.keys(this.route.snapshot.queryParams).filter((item) => {
      if (item !== 'title' && item !== 'minDate' && item !== 'maxDate') {
        return item;
      }
    });
    if (filters.length > 0) {
      this.activatedFilters = true;
    }
  }

  getGoogleAnalyticsObject() {
    return {
      category: 'newsSearch',
      action: 'submit',
      label: this.searchTitle,
    };
  }

  getTags() {

    const variables = {
      lang: 'ET',
    };

    const path = this.settings.query('getNewsTags', variables);

    const subscribe = this.http.get(path).subscribe((response:any) => {
      const data = response.data.taxonomyTermQuery.tags;

      const sortedTags = data.filter((el: any) => el.referencedNodes.count > 0);
      this.tags = sortedTags.map((el:any) => {
        return {
          value: el.entityId,
          key: el.entityLabel,
        };
      });
      subscribe.unsubscribe();
    });
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        const responsive = this.filterToggle.nativeElement.clientWidth;
        this.showFilter = responsive ? false : true;
        let fullFilters = responsive ? true : false;
        if (!responsive && this.activatedFilters) {
          fullFilters = true;
        }
        this.filterFull = fullFilters;
        this.cdr.detectChanges();
      },
      0);
  }

  ngOnInit() {
    this.toggleFilters();
    this.getTags();
  }

}
