import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';

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
  ) {}

  ngOnInit() {
    this.getTags();
  }

  ngAfterViewInit() {
    const responsive = this.filterToggle.nativeElement.clientWidth;
    this.showFilter = responsive ? false : true;
    this.filterFull = responsive ? true : false;
    this.cdr.detectChanges();
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
}
