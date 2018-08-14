import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
  styleUrls: ['compare.styles.scss']
})

export class CompareComponent implements OnInit{
  @Input() id: number;
  @Input() localStorageKey: string;
  
  checked:boolean;

  maxItemsConf = {
    "studyProgramme.compare": 3,
    "default": 10
  }

  maxReached: boolean = false;

  compare:any;
  
  constructor(
  ) {}
  
  isChecked(id){
    return this.compare.some(existing_id => existing_id == id );
  }
  removeItemFromLocalStorage(id, inputKey:string, existing: number[]){
    existing = existing.filter(existing_id => existing_id != id);
    localStorage.setItem(inputKey, JSON.stringify(existing));
  }
  addItemToLocalStorage(id, inputKey:string, existing: number[]){
    existing.push(id);
    localStorage.setItem(inputKey, JSON.stringify(existing));
  }
  compareChange(id, $event){

    this.compare = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];

    let max = this.maxItemsConf[this.localStorageKey] ? this.maxItemsConf[this.localStorageKey] : this.maxItemsConf.default;
    
    if($event.checked == true && !this.isChecked(id)){
      if(this.compare.length >= max){
        alert('Maksimaalne võrreldavate erialade arv on ületatud');
      }else{
        this.addItemToLocalStorage(id, this.localStorageKey, this.compare);
      }
    } else if ($event.checked == false && this.isChecked(id)) {
      this.removeItemFromLocalStorage(id, this.localStorageKey, this.compare);
    }
  }

  ngOnInit() {
    this.compare = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
    this.checked = this.isChecked(this.id);
  }
   
}