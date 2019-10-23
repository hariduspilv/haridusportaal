import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  public onActivate(): void {
    try {
      document.querySelector('.app-content').scrollTo({
        top: 0,
      });
    } catch (err) {}
  }
}
