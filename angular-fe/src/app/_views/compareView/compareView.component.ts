import { Component, Input } from '@angular/core';
import { CompareComponent } from '@app/_assets/compare/compare.component';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { CompareService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { translationsPerType } from '../../_assets/compare/helpers/compare';
@Component({
  selector: 'compare-view',
  templateUrl: './compareView.template.html',
  styleUrls: ['./compareView.styles.scss'],
})

export class CompareViewComponent extends CompareComponent {
  @Input() key: string = this.route.snapshot.data.type;
  @Input() queryName: string = this.route.snapshot.data.query;
  public typeUrl: string;
  private queryId: string;
  public loading: boolean = false;
  public translations = translationsPerType;
  public compare: String[] = [];
  public deleteText: string = '';
  private deleteIndicator: number = 1;
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    public translateService: TranslateService,
    public compareService: CompareService,
    public route: ActivatedRoute,
    public router: Router) {
    super(null, null, null, null);
  }

  ngOnInit() {
    this.typeUrl = this.key === 'oskaProfessionsComparison'
      ? '/ametialad/võrdlus' : '/erialad/võrdlus';
    this.compare = this.readFromLocalStorage(this.key);
    this.queryId = this.settings.query(this.queryName);
    this.getData();
  }

  getData() {
    this.loading = true;
    const allVars = {
      studyProgrammeComparison: {
        lang: 'ET',
        nidValues: `[${this.compare.map(id => id.toString())}]`,
      },
      oskaProfessionsComparison: {
        lang: 'ET',
        titleValue: '',
        titleEnabled: false,
        oskaFieldValue: '',
        oskaFieldEnabled: false,
        fixedLabelValue: '',
        fixedLabelEnabled: false,
        fillingBarValues: [],
        fillingBarFilterEnabled: false,
        sortedBy: false,
        offset: '0',
        limit: '3',
        sortField: 'title',
        sortDirection: 'ASC',
        indicatorSort: false,
        nid: this.compare,
        nidEnabled: true,
      },
    };
    const variables = allVars[this.key];

    let query = `queryName=${this.queryName}`;
    query += `&queryId=${this.queryId}&variables=${JSON.stringify(variables)}`;
    const path = `${this.settings.url}/graphql?${query}`.trim();
    this.http.get(path).subscribe((response) => {
      const data = response['data']['nodeQuery']['entities'];
      this.compareService.formatData(data, this.compare, this.key);
      this.loading = false;
      if (!data.length) this.rerouteToParent();
    },                            (err) => {
      this.rerouteToParent();
      this.loading = false;
    });
  }

  rerouteToParent(): void {
    const parentUrl = this.typeUrl.split('/')[1];
    this.router.navigateByUrl(parentUrl);
  }

  removeItemFromList(id, sessionStorageKey) {
    const existing = this.readFromLocalStorage(sessionStorageKey);
    this.removeItemFromLocalStorage(id, sessionStorageKey, existing);
    const data = this.compareService.list.filter(item => item.nid !== id);
    this.compareService.formatData(data, this.compare, this.key);

    if (!this.compareService.list.length) {
      this.rerouteToParent();
    }
  }

  setDeleteText() {
    this.deleteText = this.deleteIndicator.toString();
    this.deleteIndicator += 1;
  }
}
