import { Component, OnInit, Input, OnDestroy , SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';

import { MatDialog, MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { RootScopeService } from '@app/_services';

@Component({
  selector: 'favourites',
  templateUrl: './favourites.template.html',
  styleUrls: ['./favourites.styles.scss'],
})

export class FavouritesComponent implements OnInit, OnDestroy{
  @Input() title: string;
  @Input() id: string;
  @Input() state: boolean;

  private maxFavouriteItems = 10;
  public existingFavouriteItems: any = false;

  public loading: boolean;
  public displaySuccess: boolean;
  public favouritesDropdown: boolean = false;

  public existingItem: any;
  public existing: boolean;

  public lang: string;
  private redirectUrls = {
    "et": "/töölaud/taotlused",
    "en": "/dashboard/applications"
  }
  public subscriptions: Subscription[] = [];
  public addingSub: Subscription;
  public removingSub: Subscription;
  public processing: boolean = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public http: HttpService,
    public dialog: MatDialog,
    public translate: TranslateService,
    public snackbar: MatSnackBar,
    public rootScope: RootScopeService
    ) {}

  getFavouritesList():void{
    this.loading= true;
    this.lang = this.rootScope.get('lang');
    let variables = {
      language: this.lang.toUpperCase()
    }
    let subscription = this.http.get('customFavorites', { params: variables } ).subscribe(response => {
      if(response['data']['CustomFavorites'] && response['data']['CustomFavorites']['favoritesNew'].length) {
        this.existingFavouriteItems = response['data']['CustomFavorites']['favoritesNew'].filter(item => item.entity != null );
      } else {
        this.existingFavouriteItems = [];
      }
      this.loading = false;
      subscription.unsubscribe();
    });
  }
  openDialog(): void {
    this.dialog.open(Modal, {
      data: {
        title: this.translate.get('frontpage.favourites_limit_modal_title')['value'].toUpperCase(),
        content: this.translate.get('frontpage.favourites_limit_modal_content')['value'],
        close: this.translate.get('frontpage.favourites_limit_modal_close')['value'],
        linkStatus: true
      }
    });
  }
   compileVariables(){
    let output = {
      language: this.lang.toUpperCase(),
      id: this.id
    };
    return output;
  }

  removeFavouriteItem(){
    this.processing = true;
    if( this.removingSub !== undefined ){
      this.removingSub.unsubscribe();
    }
    this.loading = true;
    let data = { 
      queryId: "c818e222e263618b752e74a997190b0f36a39818:1",
      variables: { 
        id: this.id,
        language: this.lang.toUpperCase()
      }
    }
    this.removingSub = this.http.post('/graphql', data).subscribe(response => {
      if(response['data']['deleteFavoriteItem']['errors'].length) {
        console.error('something went terribly wrong with favourite item deletion');
      } else {
        this.openFavouriteSnackbar('remove');
        this.existingFavouriteItems.pop()
        this.state = false;
      }
      this.loading = false;
      this.removingSub.unsubscribe();
      this.processing = false;
    }, (err) => {
      this.loading = false;
      this.processing = false;
    });
  }
  submitFavouriteItem(): void {  
    this.processing = true;
    if( this.addingSub !== undefined ){
      this.addingSub.unsubscribe();
    }
    this.loading = true;
    let data = { queryId: "e926a65b24a5ce10d72ba44c62e38f094a38aa26:1" }
    data['variables'] = this.compileVariables();
    
    this.addingSub = this.http.post('/graphql', data).subscribe(response => {
      this.loading = false;
      if(response['data']['createFavoriteItem']["errors"].length){
        this.openDialog();
        if(this.snackbar) this.snackbar.dismiss();
      } else if(response['data']['createFavoriteItem']){
        this.state = true;
        this.existingFavouriteItems.push({});
        this.openFavouriteSnackbar('add');
      } 
      this.addingSub.unsubscribe();
      this.processing = false;
    }, (err) => {
      this.processing = false;
    });
  }
  openFavouriteSnackbar(operation: string) {
    let config = new MatSnackBarConfig();
    let message, action;
    
    if(operation === 'add'){
      message = this.translate.get('frontpage.favourites_snackbar_message')['value'];
      action = this.translate.get('frontpage.favourites_snackbar_action')['value'];
      config.panelClass = ['background-green', 'add'];
      config.duration = 600000;
         
    } else if ('remove'){
      message = this.translate.get('frontpage.favourites_snackbar_message_remove')['value'];
      config.panelClass = ['background-green-removed', 'remove'];
      config.duration = 3000;
    }

    let snackBarRef = this.snackbar.open(message, action ? action : undefined, config);

    snackBarRef.afterDismissed().subscribe((obj) => {
      if (obj.dismissedByAction) {
        this.router.navigateByUrl(this.redirectUrls[this.lang]);
      }
    });

 }

  addFavouriteItem(){
    if(this.canAddToFavourites() === true){
      this.submitFavouriteItem();
    } else {
      this.openDialog();
    }
  }
  canAddToFavourites(): boolean{
    if( this.existingFavouriteItems.length >= this.maxFavouriteItems) return false;
    else return true;
  }
  initiateComponent(){
    if (!this.existingFavouriteItems) {
      this.getFavouritesList();
    }
    this.lang = this.rootScope.get("lang");
  }
  destroyComponent(){
    
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    if(this.snackbar) this.snackbar.dismiss();
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.id.firstChange == false){
      this.destroyComponent();
      this.initiateComponent();
    }
  }
  ngOnInit(){
    this.initiateComponent();
  }
  ngOnDestroy(){
    this.destroyComponent();
  }
}