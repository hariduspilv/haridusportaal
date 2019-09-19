import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'infoSystem-view',
  templateUrl: 'infoSystem.template.html',
  styleUrls: ['infoSystem.styles.scss'],
})

  export class InfoSystemComponent implements OnInit{
  @Input() data: Object;
  @Input() breadcrumbs: Object[];
  public linksLabel = 'links';

  constructor(
  ) {}

  ngOnInit() {
    this.data = FieldVaryService(this.data);
  }
}
