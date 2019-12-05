import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService, SidemenuService, AlertsService, SettingsService, Alert, AlertType } from './_services';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AmpService } from './_services/ampService';
import { TranslateService } from './_modules/translate/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, AfterViewInit {

  public sidemenuIsVisible: boolean = false;
  constructor(
    public sidemenuService: SidemenuService,
    public auth: AuthService,
    private router: Router,
    private location: Location,
    private amp: AmpService,
    private alertsService: AlertsService,
    private settingsService: SettingsService,
    private translate: TranslateService,
  ) {
    this.sidemenuIsVisible = sidemenuService.isVisible;
  }
  public onActivate(): void {
    try {
      document.querySelector('.app-content').scrollTo({
        top: 0,
      });
    } catch (err) {}
  }

  closeSidemenu(event: Event) {
    if (this.sidemenuIsVisible) { this.sidemenuService.toggle(); }
    return;
  }

  cookieAlert() {
    this.alertsService.notify(new Alert({
      category: 'cookie',
      link: {
        url: this.settingsService.data.cookie_link,
        label: this.translate.get('read_terms'),
      },
      message: this.translate.get('cookie_text'),
      id: 'global',
      type: AlertType.Cookie,
      closeable: true,
    }));
  }

  ngAfterViewInit(): void {
    this.cookieAlert();
  }
  ngOnInit() {
    this.sidemenuService.isVisibleSubscription.subscribe((val) => {
      this.sidemenuIsVisible = val;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd ){
        const path = `${window.location.origin}/amp${window.location.pathname}`;
        this.amp.removeTag('rel=amphtml');
        this.amp.addTag({
          href: path,
          rel: 'amphtml',
        });
      }
    });
  }
}
