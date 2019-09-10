import {
    Component,
    Input,
  } from '@angular/core';
@Component({
  selector: 'schools',
  templateUrl: 'schools.template.html',
})

  export class SchoolsComponent {
  @Input() list: Object[];

}
