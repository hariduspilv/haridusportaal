import {
    Component,
    Input,
  } from '@angular/core';
@Component({
  selector: 'mainProfessions',
  templateUrl: 'mainProfessions.template.html',
})

  export class MainProfessionsComponent{
  @Input() list: Object[];
}
