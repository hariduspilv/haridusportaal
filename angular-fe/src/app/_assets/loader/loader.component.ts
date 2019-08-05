import { Component, Input, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'loader',
  templateUrl: './loader.template.html',
  styleUrls: ['./loader.styles.scss'],
})

export class LoaderComponent implements OnInit{
  public slowNetwork: boolean = false;

  startTimeout() {
    setTimeout(
      () => {
        this.slowNetwork = true;
      },
      3000);
  }

  ngOnInit() {
    this.startTimeout();
  }
}
