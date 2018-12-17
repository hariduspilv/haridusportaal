import { Component, OnInit, Input, OnDestroy , SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Observable, Subscription } from '../../../../node_modules/rxjs';
import { MatDialog, MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/_services/userService';
import { RootScopeService } from '@app/_services';

@Component({
  selector: 'favourites',
  templateUrl: './favourites.template.html',
  styleUrls: ['./favourites.styles.scss'],
})

export class FavouritesComponent implements OnInit, OnDestroy{
    @Input() title: string;
    @Input() id: string;

    private maxFavouriteItems = 10;
    public existingFavouriteItems;

    public initializing: boolean;
    public loading: boolean;
    public displaySuccess: boolean;
    public userLoggedOut: boolean;
    public favouritesDropdown: boolean = false;

    public existingItem: any;
    public existing: boolean;

    public lang: string;
    private redirectUrls = {
      "et": "/toolaud/taotlused",
      "en": "/dashboard/applications"
    }
    public subscriptions: Subscription[] = [];

    constructor(
      public route: ActivatedRoute,
      public router: Router,
      public http: HttpService,
      public dialog: MatDialog,
      public translate: TranslateService,
      public user: UserService,
      public snackbar: MatSnackBar,
      private rootScope: RootScopeService
      ) {
        
      }

    getFavouritesList():void{
      this.loading= true;

      let variables = {
        language: this.lang.toUpperCase()
      }
      let subscription = this.http.get('/graphql?queryName=customFavorites&queryId=94f2a6ba49b930f284a00e4900e831724fd4bc91:1&variables=' + JSON.stringify(variables)).subscribe(response => {
        
        if(this.initializing == true) this.initializing = false;
        
        if(response['data']['CustomFavorites'] && response['data']['CustomFavorites']['favoritesNew'].length) {
          this.existingFavouriteItems = response['data']['CustomFavorites']['favoritesNew'].filter(item => item.entity != null );
        }
        else {
          this.existingFavouriteItems = [];
        }
        
        if(this.id != undefined) this.isFavouriteExisting( this.existingFavouriteItems);
        
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
  removeFavouriteItem(item){
    this.loading = true;
    let data = { 
      queryId: "c818e222e263618b752e74a997190b0f36a39818:1",
      variables: { 
        id: item.targetId,
        language: this.lang.toUpperCase()
      }
    }

    let sub = this.http.post('/graphql', data).subscribe(response => {
      if(response['data']['deleteFavoriteItem']['errors'].length) {
        console.error('something went terribly wrong with favourite item deletion');
      } else {
        this.existingItem = false;
        this.existing = false;
        this.openFavouriteSnackbar('remove');
      }
      this.loading = false;
      this.getFavouritesList();
      
      sub.unsubscribe();
    });
  }
  isFavouriteExisting(list){
    if(!list.length) return false;

    this.existing = list.some(item => {
      if(item.entity != null){
        if(item.targetId == this.id ){
          this.existingItem = item;
          return true
        }
      }
    });
  }
  submitFavouriteItem(): void {   
    this.loading = true;
    let data = { queryId: "e926a65b24a5ce10d72ba44c62e38f094a38aa26:1" }
    data['variables'] = this.compileVariables();
    
    let sub = this.http.post('/graphql', data).subscribe(response => {
      this.loading = false;
      if(response['data']['createFavoriteItem']["errors"].length){
        this.openDialog();
        if(this.snackbar) this.snackbar.dismiss();
      } else if(response['data']['createFavoriteItem']){

        this.existing = true;
        
        this.getFavouritesList();
        this.openFavouriteSnackbar('add');
      } 
   
      sub.unsubscribe();
    });
  }
  openFavouriteSnackbar(operation: string) {
    let config = new MatSnackBarConfig();
    let message, action;
    
    if(operation === 'add'){
      message = this.translate.get('frontpage.favourites_snackbar_message')['value'];
      action = this.translate.get('frontpage.favourites_snackbar_action')['value'];
      config.extraClasses = ['background-green', 'add'];
      config.duration = 600000;
         
    } else if ('remove'){
      message = this.translate.get('frontpage.favourites_snackbar_message_remove')['value'];
      config.extraClasses = ['background-green-removed', 'remove'];
      config.duration = 3000;
    }

    let snackBarRef = this.snackbar.open(message, action ? action : undefined, config);

    snackBarRef.afterDismissed().subscribe((obj) => {
      if (obj.dismissedByAction) {
        this.router.navigateByUrl(this.lang + this.redirectUrls[this.lang]);
      }
    });

 }

  toggleFavouritesButton(){
    if(this.loading) return;

    this.isFavouriteExisting( this.existingFavouriteItems);

    if(this.existing === true){

      this.removeFavouriteItem(this.existingItem);

    } else {

      if(this.canAddToFavourites() === true){
        this.submitFavouriteItem();
      } else {
        this.openDialog();
      }
    }
  }
  canAddToFavourites(): boolean{
    if( this.existingFavouriteItems.length >= this.maxFavouriteItems) return false;
    else return true;
  }
  initiateComponent(){
    this.lang = this.rootScope.get("lang");
    this.initializing = true;

    this.userLoggedOut = this.user.getData()['isExpired'];
    this.getFavouritesList();
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