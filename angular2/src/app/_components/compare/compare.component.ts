import { Component, Input} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
})

export class CompareComponent{
  @Input() id: number;
  @Input() localStorageKey: string;

  compare = JSON.parse(localStorage.getItem("studyProgramme.compare")) || [];
  
  constructor(
  ) {}
  
  isChecked(id){
    return this.compare.some(existing_id => existing_id == id );
  }

  compareChange(id, checked){
    console.log('id: %s, checked: %s', id, checked);
    this.compare = JSON.parse(localStorage.getItem("studyProgramme.compare")) || [];
    if(checked == true){
      this.compare.push(id);
    } else {
      this.compare = this.compare.filter(existing_id => existing_id != id);
    }

    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
  }
   
}