import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService  } from '@app/_services/rootScopeService';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
  styleUrls: ['compare.styles.scss']
})

export class CompareComponent implements OnInit, OnDestroy{
  @Input() id: number;
  @Input() localStorageKey: string;
  
  checked:boolean;

  compareViewLink: string;
  compareViewLinkOptions = {
    "studyProgramme.compare":{
      "et": "/et/erialad/vordlus",
      "en": "/en/studyprogrammes/compare"
    }
  }
  compareTranslationOptions = {
    "studyProgramme.compare": {
      title: "studyProgramme.compare_modal_title",
      content: "studyProgramme.compare_modal_content",
      close: "studyProgramme.compare_modal_close",
    }
  }
  viewLink: boolean;

  maxItemsConf = {
    "studyProgramme.compare": 3,
    "default": 10
  }

  comparePathSubscription: any;
  localStorageSubscription: any;

  compare:any;
  
  constructor(
    public route: ActivatedRoute,
    protected rootScope: RootScopeService,
    public dialog: MatDialog,
    private translate: TranslateService
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

    this.compare = this.readFromLocalStorage(this.localStorageKey);

    let max = this.maxItemsConf[this.localStorageKey] ? this.maxItemsConf[this.localStorageKey] : this.maxItemsConf.default;
    
    if($event.checked == true && !this.isChecked(id)){
      if(this.compare.length >= max){
        $event.source._checked = false
        this.openDialog();
        
      }else{
        this.addItemToLocalStorage(id, this.localStorageKey, this.compare);
      }
    } else if ($event.checked == false && this.isChecked(id)) {
      this.removeItemFromLocalStorage(id, this.localStorageKey, this.compare);
    }

    this.rootScope.get("compareObservable").next(false);
  }

  displayViewLink(list): void {
    this.viewLink = list.length? true: false;
  }
  readFromLocalStorage(key){
    let data = JSON.parse(localStorage.getItem(key))
    return data instanceof Array ? data : [];
  }
  openDialog(): void {
		let dialogRef = this.dialog.open(Modal, {

		  data: {
        title: this.translate.get(this.compareTranslationOptions[this.localStorageKey].title)['value'].toUpperCase(),
        content: this.translate.get(this.compareTranslationOptions[this.localStorageKey].content)['value'],
        close: this.translate.get(this.compareTranslationOptions[this.localStorageKey].close)['value']
		  }
		});

  }
  ngOnInit() {
    this.compare = this.readFromLocalStorage(this.localStorageKey);
  
    this.checked = this.isChecked(this.id);

    let fallbackPath = this.compareViewLinkOptions[this.localStorageKey]['et'];

    this.comparePathSubscription = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.compareViewLink = this.compareViewLinkOptions[this.localStorageKey][params['lang']] || fallbackPath
      }
    );

    this.displayViewLink(this.compare);

    this.localStorageSubscription = this.rootScope.get("compareObservable").subscribe(data => {
      this.compare = this.readFromLocalStorage(this.localStorageKey);
      this.displayViewLink(this.compare);
    });
  }

  ngOnDestroy() {
    this.comparePathSubscription.unsubscribe();
    this.localStorageSubscription.unsubscribe();
  }
   
}