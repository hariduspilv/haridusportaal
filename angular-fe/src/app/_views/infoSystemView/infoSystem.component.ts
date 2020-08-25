import {
    Component,
    OnInit,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
import { SettingsService, AlertsService } from '@app/_services';
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
  @Input() path: any = '';
  public linksLabel = 'links';
  public loading: boolean = true;
  public origData: any = {};
  private paramsWatcher: Subscription = new Subscription();

  constructor(
        private settings: SettingsService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private location: Location,
        private alertService: AlertsService,
        private cdr: ChangeDetectorRef,
    ) { }

  private getData(): void {
    const variables = {
      path: this.path,
    };

    const path = this.settings.query('infoSystemPage', variables);

    const subscription = this.http.get(path).subscribe((response) => {

      this.origData = response['data']['route']['entity'];

      this.data = FieldVaryService(response['data']['route']['entity']);

      if (Array.isArray(this.data.video) && this.data.video.length > 1) {
        this.data.additionalVideos = this.data.video.slice(1, 10);
        this.data.video = this.data.video[0];
      }

      this.getSidebar();

      this.getAlert();

      this.loading = false;

            // this.feedbackNid = this.data.nid;

      subscription.unsubscribe();
    });

  }
  private watchParams() {
    this.paramsWatcher = this.route.params.subscribe((routeParams) => {
      this.data = false;
      this.initialize(true);
    });
  }

  private getAlert() {
    const observer = new MutationObserver((mutations, me) => {
      const canvas = document.getElementById('infosystemAlert');
      if (canvas && this.data.alert) {
        this.alertService.clear('infosystemAlert');
        if (this.data.alert) {
          this.alertService.error(this.data.alert, 'infosystemAlert', 'infosystemAlert', false, '', 'alert-circle');
        }
        delete this.data.alert;
        me.disconnect();
        return;
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }
  private getSidebar() {
    if (this.data.sidebar.entity.fieldButton.title) {
      this.data.sidebar.entity.fieldButton = [
        this.data.sidebar.entity.fieldButton,
        {
          title: 'infosystem.my-details',
          color: 'white',
          login: true,
          url: {
            path: '/töölaud/õpingud',
            routed: true,
          },
        },
      ];
    }
    this.data.sidebar.entity.fieldEhisLinks = this.data.sidebar.entity.fieldEhisLinks ? [this.data.sidebar.entity.fieldEhisLinks] : [];
  }

  private initialize(forceNewPath = false) {
    if (forceNewPath) {
      this.path = decodeURI(this.location.path());
    } else {
      this.path = decodeURI(this.path || this.location.path());
    }
    if (!this.data) {
      this.getData();
    }
  }
  ngOnInit() {
    this.watchParams();
  }
  ngOnDestroy(): void {
    this.paramsWatcher.unsubscribe();
  }
}
