import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
  filterFull = false;
  showFilter = true;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.getTags();
  }

  ngAfterViewInit() {
    this.showFilter = this.filterToggle.nativeElement.clientWidth ? false : true;
    this.filterFull = true;
  }

  getTags() {

    let variables = {
      lang: 'ET',
    };

    const path = this.settings.query('getNewsTags', variables);

    const subscribe = this.http.get(path).subscribe((response:any) => {
      const data = response.data.taxonomyTermQuery.tags;

      const sortedTags = data.filter((el) => el.referencedNodes.count > 0);
      this.tags = sortedTags.map((el) => {
        return {
          value: el.entityId,
          key: el.entityLabel,
        };
      });
      subscribe.unsubscribe();
    });
  }
}
