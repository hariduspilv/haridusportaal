import { Component, Input} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
})

export class CompareComponent{
  @Input() id: number;
  @Input() localStorageKey: string;
  
  compare = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
  
  constructor(
  ) {}
  
  isChecked(id){
    return this.compare.some(existing_id => existing_id == id );
  }

  compareChange(id, checked){

    this.compare = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];

    if(checked == true && !this.isChecked(id)){
      this.compare.push(id);
    } else if (checked == false && this.isChecked(id)) {
      this.compare = this.compare.filter(existing_id => existing_id != id);
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(this.compare));
  }
   
}