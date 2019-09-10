import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'infoSystem',
  templateUrl: 'infoSystem.template.html',
  styleUrls: ['infoSystem.styles.scss'],
})

  export class ListItemComponent implements OnInit{
  @Input() data: Object;

  constructor(
  ) {}

  ngOnInit() {
    this.data = FieldVaryService(this.data);
  }
}
