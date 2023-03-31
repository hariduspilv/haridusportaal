import {Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef} from '@angular/core';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import {TranslateService} from "@app/_modules/translate/translate.service";
import {Observable} from "rxjs";

@Component({
  selector: 'schoolFunding-view',
  templateUrl: 'schoolFundingView.template.html',
  styleUrls: ['schoolFundingView.styles.scss'],
})

export class SchoolFundingViewComponent implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }

  @ViewChild('filterToggle') filterToggle: ElementRef;

  public showFilter = true;
  public filterFull = false;
  public loading = true;

  public institutionOwnershipItems: object[] | boolean = false;
  public investmentMeasureItems: object[] | boolean = false;
  public investmentDeadlineYearItems: object[] | boolean = false;

  public investmentDeadlineYear: any = false;
  public investmentMeasure: any = false;
  public institutionOwnership: any = false;
  public markers: Object[];
  public params: any = {};

  public breadcrumbs = [
    {
      link: '/',
      title: 'frontpage.label',
    },
    {
      link: '',
      title: 'school.support_projects',
    },
  ];

  public options: Object = {
    polygonType: 'investment', // ...
    zoom: 8.5,
    maxZoom: 20,
    minZoom: 8.5,
    draggable: true,
    enablePolygonModal: false,
    enableStreetViewControl: false,
  };

  watchParams() {
    if (Object.keys(this.params).length === 0) {
      this.params = this.route.queryParams;
      this.investmentDeadlineYear = this.params.investmentDeadlineYear;
      this.investmentMeasure = this.params.investmentMeasure;
      this.institutionOwnership = this.params.institutionOwnership;
    }
    this.route.queryParams.subscribe((params: any) => {
      this.getData(params);
      this.params = params;
      this.investmentDeadlineYear = params.investmentDeadlineYear;
      this.investmentMeasure = params.investmentMeasure;
      this.institutionOwnership = params.institutionOwnership;
    });
  }

  getData(params: any = {}) {
    this.loading = true;
    const variables = {
      ownershipType: Number(params.institutionOwnership),
      investmentMeasure: Number(params.investmentMeasure),
      investmentDeadline: Number(params.investmentDeadlineYear),
      levelOfDetail: 3,
    };

    const query = this.settingsService.query('subsidyProjectQuerySchool', variables);

    this.http.get(query).subscribe({
      next: ({ data }: any) => {
        this.markers = data.CustomSubsidyProjectQuery;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  parseFilters(data) {
    let years = [];

    for (const i in data['investmentDeadline']['entities']) {
      let year: any = data['investmentDeadline']['entities'][i]['investmentDeadline']['value'];
      year = parseInt(year.split('-')[0], 10);
      if (years.indexOf(year) === -1) {
        years.push(year);
      }
    }

    years = years.sort().reverse();

    this.investmentDeadlineYearItems = years.map(
      (year: any) => {
        return {
          value: year, key: `${year}`,
        };
      },
    );
    this.investmentMeasureItems = data.investmentMeasure.entities.filter((el:any) => {
      if (el.reverseInvestmentMeasureSubsidyProjectEntity.count > 0) {
        return true;
      }
      return false;
    }).map((el: any) => {
      return {
        key: el.entityLabel,
        value: el.tid,
      };
    });

    this.institutionOwnershipItems = data.ownerShipType.entities.filter((el:any) => {
      if (el.reverseFieldOwnershipTypeNode.count > 0) {
        return true;
      }
      return false;
    }).map((el: any) => {
      return {
        key: el.entityLabel,
        value: el.tid,
      };
    });
  }

  getFilters() {
    const variables = {
			lang: this.settingsService.currentAppLanguage,
    };
    const query = this.settingsService.query('subsidyProjectFilters', variables);
    this.http.get(query).subscribe({
			next: ({ data }: any) => {
				this.parseFilters(data);
				this.watchParams();
			},
		});
  }

  ngOnInit() {
    this.getFilters();
		this.settingsService.currentLanguageSwitchLinks = null;
	}
}
