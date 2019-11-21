import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'infoSystem-view',
  templateUrl: 'infoSystem.template.html',
  styleUrls: ['infoSystem.styles.scss'],
})

export class InfoSystemViewComponent implements OnInit {
  @Input() data;
  @Input() breadcrumbs;
  public path: any = '';
  public linksLabel = 'links';
  public loading: boolean = true;
  public origData: any = {};
  private paramsWatcher: Subscription = new Subscription();

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  private getData():void {
    const variables = {
      path: this.path,
    };

    const path = this.settings.query('infoSystemPage', variables);

    const subscription = this.http.get(path).subscribe((response) => {

      this.origData = response['data']['route']['entity'];

      this.data = FieldVaryService(response['data']['route']['entity']);

      if (Array.isArray(this.data.video) && this.data.video.length > 1) {
        this.data.additionalVideos = this.data.video.slice(1, 10);
        this.data.video.splice(0, 1);
      }

      this.loading = false;

      // this.feedbackNid = this.data.nid;

      // this.getSidebar();
      subscription.unsubscribe();

    });

  }
  private watchParams() {
    this.paramsWatcher = this.route.params.subscribe((routeParams) => {
      this.data = false;
      this.initialize();
    });
  }

  private initialize() {
    this.path = decodeURI(this.location.path());
    if (!this.data) {
      this.getData();
    }
  }
  ngOnInit() {
    this.watchParams();
    this.initialize();
  }
}
