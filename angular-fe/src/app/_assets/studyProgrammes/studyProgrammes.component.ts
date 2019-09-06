import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
@Component({
  selector: 'studyProgrammes',
  templateUrl: 'studyProgrammes.template.html',
  styleUrls: ['studyProgrammes.styles.scss'],
})

  export class ListItemComponent implements OnInit{
  @Input() list: Object[];

  public objectKeys = Object.keys;

  constructor(
  ) {}

  ngOnInit() {

  }
}
