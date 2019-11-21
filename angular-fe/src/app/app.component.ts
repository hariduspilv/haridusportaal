import { Component, OnInit } from '@angular/core';
import { AuthService, SidemenuService } from './_services';

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
    this.auth.isLoggedIn();
  }
}
