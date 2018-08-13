import { Component, Input} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
})

export class CompareComponent{
  @Input() id: number;
  @Input() localStorageKey: string;

  compare = JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};
  
  constructor(
  ) {}

  compareChange(id, $event){
    this.compare = JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};
    $event.checked === true? this.compare[id] = true : delete this.compare[id];
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
  }
   
}