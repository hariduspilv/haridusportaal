import { Component, OnInit } from "@angular/core";
import { SettingsService } from '@app/_core/settings';

@Component({
  templateUrl: 'variables.template.html'
})

export class VariablesComponent implements OnInit{

  data: any = [];

  constructor(
    private settings: SettingsService
  ){}

  ngOnInit() {
    this.data = [];

    for( var i in this.settings.data ){
      this.data.push({
        key: i,
        value: this.settings.data[i]
      });
    }

  }
}