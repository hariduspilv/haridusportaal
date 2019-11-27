import { Component, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'schoolFunding-view-areas',
  templateUrl: 'schoolFundingAreasView.template.html',
  styleUrls: ['../schoolFundingView.styles.scss'],
})

export class SchoolFundingAreasViewComponent {

  constructor(
    private settingsService: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }

  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  showFilter = true;
  filterFull = false;
  loading = false;

  public institutionOwnershipItems: object[] | boolean = false;
  public investmentMeasureItems: object[] | boolean = false;
  public investmentDeadlineYearItems: object[] | boolean = false;

  public investmentDeadlineYear: any = false;
  public investmentMeasure: any = false;
  public institutionOwnership: any = false;

  public params: any = {};

  public breadcrumbs = [
    {
      link: '/',
      title: 'Avaleht',
    },
    {
      link: '',
      title: 'Toetusprojektid',
    },
  ];

  public options: Object = {
    polygonType: 'investment', // ...
    centerLat: 59.4371821, // Uses EST center if not specified
    centerLng: 24.7450143,
    zoom: 11,
    maxZoom: 11,
    minZoom: 11,
    draggable: true,
    zoomControl: false,
    streetViewControl: false,
    showOuterLink: true,
    showLabels: true,
    showParameters: false,
    showPolygonLayerSelection: false,
    showPolygonLegend: false,
    enablePolygonModal: false,
  };

  watchParams() {
    if (Object.keys(this.params).length === 0) {
      this.params = this.route.queryParams;
      this.investmentDeadlineYear = this.params.investmentDeadlineYear;
      this.investmentMeasure = this.params.investmentMeasure;
      this.institutionOwnership = this.params.institutionOwnership;
    }
    this.route.queryParams.subscribe((params: any) => {
      console.log(params);
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
      ownerShipType: params.institutionOwnerShip,
      investmentMeasure: params.investmentMeasure,
      investmentDeadline: params.investmentDeadlineYear,
      levelOfDetail: 1,
    };

    const query = this.settingsService.query('subsidyProjectQueryLocation', variables);

    this.http.get(query).subscribe((data: any) => {
      console.log(data);
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
      lang: 'ET',
    };
    const query = this.settingsService.query('subsidyProjectFilters', variables);
    this.http.get(query).subscribe(({ data }: any) => {
      console.log(data);
      this.parseFilters(data);
      this.watchParams();
    });
  }

  ngOnInit() {
    this.getFilters();
  }
}
