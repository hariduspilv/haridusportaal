import { Component, OnInit } from '@angular/core';
import { AuthService, SidemenuService } from './_services';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AmpService } from './_services/ampService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {

  public sidemenuIsVisible: boolean = false;
  constructor(
    public sidemenuService: SidemenuService,
    public auth: AuthService,
    private router: Router,
    private location: Location,
    private amp: AmpService,
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
    // this.auth.isLoggedIn();
  }
}
