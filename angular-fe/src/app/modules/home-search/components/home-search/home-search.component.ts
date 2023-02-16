import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbsItem } from '@app/_assets/breadcrumbs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HomeSearchUtility } from '../../home-search';
import { SettingsService } from '@app/_services';
import { HomeSearchApiService } from '../../home-search-api.service';
import { HomeSearch, HomeSearchParameters, HomeSearchResult, HomeSearchType, MappedHomeSearch } from '../../home-search.model';

@Component({
  selector: 'home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss'],
})
export class HomeSearchComponent implements OnInit {

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    public formBuilder: UntypedFormBuilder,
    private api: HomeSearchApiService,
		private settings: SettingsService,
	) {}

  breadcrumbs: BreadcrumbsItem[];
  searchGroup: UntypedFormGroup = this.formBuilder.group({
    parameter: [''],
  });
  oskaTypesToMerge: string[] =
    ['oska_survey_page', 'oska_main_profession_page', 'oska_field_page', 'oska_result_page'];
  contentTypes: Record<string, HomeSearchType> = {
    article: { name: 'article.label', value: true, sum: 0 },
    news: { name: 'news.label', value: true, sum: 0 },
    oska: { name: 'oska.future_job_opportunities', value: true, sum: 0 },
    event: { name: 'event.label', value: true, sum: 0 },
    school: { name: 'school.label', value: true, sum: 0 },
    studyprogramme: { name: 'studyProgramme.label', value: true, sum: 0 },
  };

  entities: HomeSearchResult[];
  count: number;
  activeContentTypes: [string, HomeSearchType][];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const { marksona, tuup } = params;
      if (marksona) {
        this.breadcrumbs = HomeSearchUtility.constructCrumbs(marksona);
        this.getMappedHomeSearchResults({ lang: this.settings.currentAppLanguage, search_term: marksona })
          .subscribe(({ entities, count, types }: MappedHomeSearch) => {
            this.entities = entities;
            this.count = count;
            this.activeContentTypes = Object.entries(types);
          });
      }
    });
    // this.searchGroup.get('parameter').valueChanges.subscribe(event => console.log(event));
  }

  getMappedHomeSearchResults(parameters: HomeSearchParameters): Observable<MappedHomeSearch> {
    return this.api.getHomeSearch(parameters).pipe(map((results: HomeSearch) => {
      return HomeSearchUtility.mergeHomeSearchContentTypesAndCollectCounts(results,
                                                                           this.oskaTypesToMerge, this.contentTypes);
    }));
  }

  autoCompleteChanged(updatedValue: string) {
    this.updateQueryParams('marksona', updatedValue);
  }

  updateQueryParams(key: string, params: string | string[]) {
    const updatedParams = HomeSearchUtility.updateParams(this.route.snapshot.queryParams, key, params);
    this.router.navigate([], { queryParams: updatedParams, replaceUrl: true });
  }

  getGoogleAnalyticsObject() {
    return {
      category: 'homeSearch',
      action: 'submit',
      label: this.searchGroup.get('parameter').value,
    };
  }

}
