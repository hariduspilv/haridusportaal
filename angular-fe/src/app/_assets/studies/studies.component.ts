import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';
import { AlertsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AccordionComponent } from '../accordion';
import { StudiesResponse } from './studies.model';

@Component({
  selector: 'studies',
  templateUrl: './studies.template.html',
  styleUrls: ['./studies.styles.scss'],
})

export class StudiesComponent implements OnInit {
  @Input() jwt;
  @ViewChild('sudiesAccordion') accordion: AccordionComponent;
  content: any = false;
  loading: boolean = true;
  error: boolean = false;
  requestErr: boolean = false;
  dataErr: boolean = false;
  oppelaenOigus: any = false;
  totalAccordions: number = 0;
  activeAccordions: number = 0;
  headers: HttpHeaders;
  public expandedStates: boolean[] = [];
  public stateChanged: boolean;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/studies?_format=json`,
      )
      .subscribe(
        (response: StudiesResponse) => {
          if (response.error) {
            this.error = true;
            this.requestErr = true;
            const currentLang = 'et';
            this.alertsService
              .info(response.error.message_text[currentLang], 'studies', 'studies', false, false);
          } else {
            if (response.value?.isikuandmed) {
              this.oppelaenOigus = response.value.isikuandmed.oppelaenOigus;
            }
            const resultData = response.value.oping;
            this.content = resultData.sort((a, b) => {
              const arrA = a.oppAlgus.split('.');
              const valA = `${arrA[2]}-${arrA[1]}-${arrA[0]}`;
              const arrB = b.oppAlgus.split('.');
              const valB = `${arrB[2]}-${arrB[1]}-${arrB[0]}`;
              return +new Date(valB) - +new Date(valA);
            });
            if (!this.content.length) {
              this.error = true;
              this.dataErr = true;
              this.alertsService
                .info('errors.studies_data_missing', 'studies');
            } else {
              this.initializeAccordionStates(this.content);
            }
          }
          sub.unsubscribe();
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.error = true;
          this.requestErr = true;
          this.alertsService
            .info('errors.studies_data_missing', 'studies');
        });
  }

  openAllAccordions() {
    this.accordion.openAll();
  }

  closeAllAccordions() {
    this.accordion.closeAll();
  }

  accordionChange($event): void {
    this.totalAccordions = $event.length;
    this.activeAccordions = $event.filter((item) => {
      return item.isActive ? item : false;
    }).length;
  }

  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type.toLocaleLowerCase();
    }
    return translation.toLocaleLowerCase();
  }

  initializeAccordionStates(arr: object[]) {
    arr.forEach(() => this.expandedStates.push(false));
  }

  setAccordionStates(state: boolean) {
    this.stateChanged = true;
    this.expandedStates = this.expandedStates.map(elem => state);
  }

  closedAccordionsExist(): number {
    return this.expandedStates.filter(elem => !elem).length;
  }
}
