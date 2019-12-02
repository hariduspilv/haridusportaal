import { Component, ViewChild, ElementRef } from '@angular/core';
import { SettingsService, MapService } from '@app/_services';
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
    private mapService: MapService,
  ) { }

  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  public showFilter = true;
  public filterFull = false;
  public loading = true;

  public institutionOwnershipItems: object[] | boolean = false;
  public investmentMeasureItems: object[] | boolean = false;
  public investmentDeadlineYearItems: object[] | boolean = false;

  public investmentDeadlineYear: any = false;
  public investmentMeasure: any = false;
  public institutionOwnership: any = false;
  public polygonData: Object;
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
    polygonType: 'investment',
    zoom: 7.4,
    maxZoom: 16,
    minZoom: 7,
    draggable: true,
    enablePolygonLegend: true,
    enablePolygonModal: true,
    enableLayerSelection: true,
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
      this.getData(params, this.mapService.polygonLayer.getValue());
      this.params = params;
      this.investmentDeadlineYear = params.investmentDeadlineYear;
      this.investmentMeasure = params.investmentMeasure;
      this.institutionOwnership = params.institutionOwnership;
    });
  }

  getData(params: any = {}, levelOfDetail: number): void {
    this.loading = true;
    const variables = {
      levelOfDetail,
      ownershipType: params.institutionOwnership,
      investmentMeasure: params.investmentMeasure,
      investmentDeadline: params.investmentDeadlineYear,
    };
    const query = this.settingsService.query('subsidyProjectQueryLocation', variables);
    this.http.get(query).subscribe(({ data }: any) => {
      this.polygonData = {
        county: data.CustomSubsidyProjectQuery,
        kov: data.CustomSubsidyProjectQuery,
      };
      this.mapService.polygonLayer.next(levelOfDetail);
    },                             () => this.loading = false);
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
      this.parseFilters(data);
      this.watchParams();
    });
  }

  onLayerChange(layer: string): void {
    const levelOfDetail: number = layer !== 'kov' ? 1 : 2;
    this.getData(this.params, levelOfDetail);
  }

  ngOnInit() {
    this.getFilters();
  }
}
