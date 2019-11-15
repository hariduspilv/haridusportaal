import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {

  constructor(
    public auth: AuthService,
  ) {}
  public onActivate(): void {
    try {
      document.querySelector('.app-content').scrollTo({
        top: 0,
      });
    } catch (err) {}
  }

  ngOnInit() {
    this.auth.isLoggedIn();
  }
}
