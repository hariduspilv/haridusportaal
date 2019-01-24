import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RootScopeService  } from '@app/_services/rootScopeService';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';

@Component({
  selector: 'compare',
  templateUrl: 'compare.component.html',
  styleUrls: ['compare.styles.scss']
})

export class CompareComponent implements OnInit, OnDestroy{
  @Input() id: number;
  @Input() sessionStorageKey: string;
  
  checked:boolean;

  keydown: boolean = false;

  keyDownEvent = (event) => {
    if (event.ctrlKey || event.metaKey) {
      this.keydown = true;
    }
  }
  keyUpEvent = (event) => {
    this.keydown = false;
  }

  compareViewLink: string;
  compareViewLinkOptions = {
    "studyProgramme.compare":{
      "et": "/erialad/võrdlus"
    },
    "oskaProfessions.compare":{
      "et": "/ametialad/võrdlus",
    }
  }
  compareTranslationOptions = {
    "studyProgramme.compare": {
      added: "studyProgramme.added_to_comparison",
      in: "studyProgramme.in_comparison",
      title: "studyProgramme.compare_modal_title",
      content: "studyProgramme.compare_modal_content",
      close: "studyProgramme.compare_modal_close",
    },
    "oskaProfessions.compare": {
      added: "oskaProfessions.added_to_comparison",
      in: "oskaProfessions.in_comparison",
      title: "oskaProfessions.compare_modal_title",
      content: "oskaProfessions.compare_modal_content",
      close: "oskaProfessions.compare_modal_close",
    }
  }
  viewLink: boolean;

  maxItemsConf = {
    "studyProgramme.compare": 3,
    "oskaProfessions.compare": 3,
    "default": 10
  }

  public snackBarOpen: boolean;
  comparePathSubscription: any;
  sessionStorageSubscription: any;

  compare:any;
  
  constructor(
    public route: ActivatedRoute,
    protected rootScope: RootScopeService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
    public router: Router
  ) {}

  isChecked(id){
    return this.compare.some(existing_id => existing_id == id );
  }
  removeItemFromLocalStorage(id, inputKey:string, existing: number[]){
    existing = existing.filter(existing_id => existing_id != id);
    sessionStorage.setItem(inputKey, JSON.stringify(existing));
  }
  addItemToLocalStorage(id, inputKey:string, existing: number[]){
    existing.push(id);
    sessionStorage.setItem(inputKey, JSON.stringify(existing));
  }
  compareChange(id, $event){

    this.compare = this.readFromLocalStorage(this.sessionStorageKey);

    let max = this.maxItemsConf[this.sessionStorageKey] ? this.maxItemsConf[this.sessionStorageKey] : this.maxItemsConf.default;
    
    if($event.checked == true && !this.isChecked(id)){
      if(this.compare.length >= max){
        $event.source._checked = false
        this.openDialog();
        
      }else{
        this.addItemToLocalStorage(id, this.sessionStorageKey, this.compare);
      }
    } else if ($event.checked == false && this.isChecked(id)) {
      this.removeItemFromLocalStorage(id, this.sessionStorageKey, this.compare);
    }

    this.rootScope.get("compareObservable").next(false);
  }

  displayViewLink(list): void {
    this.viewLink = list.length? true: false;
  }
  readFromLocalStorage(key){
    let data = JSON.parse(sessionStorage.getItem(key))
    return data instanceof Array ? data : [];
  }
  openDialog(): void {
		let dialogRef = this.dialog.open(Modal, {

		  data: {
        title: this.translate.get(this.compareTranslationOptions[this.sessionStorageKey].title)['value'].toUpperCase(),
        content: this.translate.get(this.compareTranslationOptions[this.sessionStorageKey].content)['value'],
        close: this.translate.get(this.compareTranslationOptions[this.sessionStorageKey].close)['value']
		  }
		});

  }

  openCompareSnackbar(panelClass:string = "success") {
    /**
      @param {string} panelClass success | info | warning | error.
    */
  
    if (this.viewLink && this.compare.length && !this.snackBarOpen) {

      this.snackBarOpen = true;
      let message = this.translate.get(this.compareTranslationOptions[this.sessionStorageKey].added)['value'];
      if( panelClass == "info" ){
        message = this.translate.get(this.compareTranslationOptions[this.sessionStorageKey].in)['value'];
      }
      let action = this.translate.get('button.see_comparison')['value'];
      let snackBarRef = this.snackbar.open(message, action, {
        duration: 600000,
        panelClass: panelClass
      });

      snackBarRef.afterDismissed().subscribe((obj) => {
        if (obj.dismissedByAction) {
          if (this.keydown) {
            window.open(this.compareViewLink, '_blank');
            this.snackBarOpen = false;
          } else {
            this.router.navigateByUrl(this.compareViewLink);
            this.snackBarOpen = false;
          }
        }
      });

    } else if (!this.viewLink){
      this.snackbar.dismiss();
      this.snackBarOpen = false;
    }
  }
  ngOnInit() {
    document.addEventListener('keydown', this.keyDownEvent);

    document.addEventListener('keyup', this.keyUpEvent);

    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
  
    this.checked = this.isChecked(this.id);

    let fallbackPath = this.compareViewLinkOptions[this.sessionStorageKey]['et'];

    this.compareViewLink = this.compareViewLinkOptions[this.sessionStorageKey][this.rootScope.get("lang")] || fallbackPath

    this.displayViewLink(this.compare);
    this.openCompareSnackbar("info");

    this.sessionStorageSubscription = this.rootScope.get("compareObservable").subscribe(data => {
      this.compare = this.readFromLocalStorage(this.sessionStorageKey);
      this.displayViewLink(this.compare);
      this.openCompareSnackbar()
    });
  }

  ngOnDestroy() {
    document.removeEventListener("keydown", this.keyDownEvent);
    document.removeEventListener("keyup", this.keyUpEvent);
    this.sessionStorageSubscription.unsubscribe();
    this.snackbar.dismiss()
    this.snackBarOpen = false;
  }
   
}