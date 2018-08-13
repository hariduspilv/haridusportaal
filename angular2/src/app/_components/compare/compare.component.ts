import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
})

export class CompareComponent implements OnInit{
  @Input() id: number;
  @Input() localStorageKey: string;
  
  checked:boolean;

  compare:any;
  
  constructor(
  ) {}
  
  isChecked(id){
    return this.compare.some(existing_id => existing_id == id );
  }

  compareChange(id, checked, inputKey:any = false){

    let key = inputKey ? inputKey : this.localStorageKey;

    this.compare = JSON.parse(localStorage.getItem(key)) || [];

    if(checked == true && !this.isChecked(id)){
      this.compare.push(id);
    } else if (checked == false && this.isChecked(id)) {
      this.compare = this.compare.filter(existing_id => existing_id != id);
    }

    localStorage.setItem(key, JSON.stringify(this.compare));
  }

  ngOnInit() {
    this.compare = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    this.checked = this.compare.some(existing_id => existing_id == this.id );
  }
   
}