import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
})

export class CompareComponent implements OnInit {
  @Input() id: number;
  @Input() localStorageKey: string;

  compare = JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};
  
  constructor(
  ) {}

  compareChange(id, $event){
    console.log(id);
    $event.checked === true? this.compare[id] = true : delete this.compare[id];
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
  }
  ngOnInit() {
    console.log('Hello compare component');
    console.log(this.id)
  }
   
}