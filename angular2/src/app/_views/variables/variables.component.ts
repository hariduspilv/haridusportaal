import { Component, OnInit } from "@angular/core";
import { SettingsService } from '@app/_services/settings.service';

@Component({
  templateUrl: 'variables.template.html'
})

export class VariablesComponent implements OnInit{

  data: any = [];

  constructor(
    private settings: SettingsService
  ){}

  objectKeys = Object.keys;

  varType(input) {
    return typeof input;
  }

  ngOnInit() {

    this.data = [];

    for( var i in this.settings.data ){
      this.data.push({
        key: i,
        value: this.settings.data[i]
      });
    }

    for( var i in this.settings.requests ){
      this.data.push({
        key: i,
        value: this.settings.requests[i]
      });
    }

  }
}