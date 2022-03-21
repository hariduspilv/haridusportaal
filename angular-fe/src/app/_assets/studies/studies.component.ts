import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';
import { AlertsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AccordionComponent } from '../accordion';
import { ExternalQualifications, OppelaenOigus, Studies, StudiesResponse } from './studies.model';
import { dateSortFn } from './studies.utility';

@Component({
  selector: 'studies',
  templateUrl: './studies.template.html',
  styleUrls: ['./studies.styles.scss'],
})
export class StudiesComponent implements OnInit {
  @ViewChild('studiesAccordion') accordion: AccordionComponent;
  public content: (Studies | ExternalQualifications)[];
  public loading: boolean = true;
  public error: boolean = false;
  public requestErr: boolean = false;
  public dataErr: boolean = false;
  public oppelaenOigus: OppelaenOigus;
  public totalAccordions: number = 0;
  public activeAccordions: number = 0;
  public headers: HttpHeaders;
  public expandedStates: boolean[] = [];
  public stateChanged: boolean;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) { }

  /**
   * Get the title for the accordion according to the item
   * @param item Study or External Qualification
   */
  public getAccordionTitle(item: Studies | ExternalQualifications): string {
    const test1 = item as Studies;
    if (test1.oppeasutus) {
      return test1.oppeasutus
        + (test1.staatus ? ', ' + this.parseTypeTranslation(test1.staatus) : '')
        + (test1.oppLopp ? ' ' + test1.oppLopp : '');
    }
    const test2 = item as ExternalQualifications;
    return (test2.oppeasutuseNimi
        || test2.oppeasutuseNimiTranslit
        || test2.oppeasutuseNimiMuusKeeles
        || '').trim()
      + (test2.valjaandmKp
        ? ', ' + this.parseTypeTranslation('LOPETANUD') + ' ' + test2.valjaandmKp
        : '');
  }

  public ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.loading = true;
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/studies?_format=json`,
      )
      .subscribe({
        next: (response: StudiesResponse) => {
          if (response.error) {
            this.error = true;
            this.requestErr = true;
            this.alertsService.info('errors.studies_data_missing', 'studies');
          } else {
            if (response.value?.isikuandmed) {
              this.oppelaenOigus = response.value.isikuandmed.oppelaenOigus;
            }
            // Add type to the external qualifications and combine the results
            const resultData = [
              ...response.value.oping,
              ...response.value.valineKvalifikatsioon.map(r => {
                r.tyyp = 'VALISMAA';
                return r;
              }),
              ...response.value.enne2004Kvalifikatsioon.map(r => {
                r.tyyp = 'ENNE_2004_EESTI';
                return r;
              }),
            ];
            // Sort currently studying and finished separately
            this.content = [
              ...resultData.filter(x => (x as Studies).staatus === 'OPIB_HETKEL').sort(dateSortFn),
              ...resultData.filter(x => (x as Studies).staatus !== 'OPIB_HETKEL').sort(
                (a, b) => dateSortFn(a, b, 'oppLopp'),
              ),
            ];
            if (!this.content.length) {
              this.error = true;
              this.dataErr = true;
              this.alertsService.info('errors.studies_data_missing', 'studies');
            } else {
              this.initializeAccordionStates(this.content);
            }
          }
          sub.unsubscribe();
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.requestErr = true;
          this.alertsService
            .info('errors.studies_data_request', 'studies');
        }
      });
  }

  public openAllAccordions() {
    this.accordion.openAll();
  }

  public closeAllAccordions() {
    this.accordion.closeAll();
  }

  public accordionChange($event): void {
    this.totalAccordions = $event.length;
    this.activeAccordions = $event.filter((item) => {
      return item.isActive ? item : false;
    }).length;
  }

  public parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type.toLocaleLowerCase();
    }
    return translation.toLocaleLowerCase();
  }

  public initializeAccordionStates(arr: object[]) {
    arr.forEach(() => this.expandedStates.push(false));
  }

  public setAccordionStates(state: boolean) {
    this.stateChanged = true;
    this.expandedStates = this.expandedStates.map(elem => state);
  }

  public closedAccordionsExist(): number {
    return this.expandedStates.filter(elem => !elem).length;
  }
}
