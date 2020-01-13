import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { SettingsService } from '@app/_services';

@Component({
  selector: 'loader',
  templateUrl: './loader.template.html',
  styleUrls: ['./loader.styles.scss'],
})

export class LoaderComponent implements OnInit{
  public slowNetwork: boolean = false;

  constructor(
    private settings: SettingsService,
  ) {}

  startTimeout() {
    const timeOut = this.settings.data.loader
    && this.settings.data.loader.timeout
    ? this.settings.data.loader.timeout
    : 3000;

    setTimeout(
      () => {
        this.slowNetwork = true;
      },
      timeOut);
  }

  ngOnInit() {
    this.startTimeout();
  }
}
