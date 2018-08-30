import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Observable, Subscription } from '../../../../node_modules/rxjs';
import { MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/_services/userService'
@Component({
  selector: 'favourites',
  templateUrl: './favourites.template.html',
  styleUrls: ['./favourites.styles.scss']
})

export class FavouritesComponent implements OnInit, OnDestroy{
  /** 
    * if (this.id === undefined)
    * then (this.type = 'search')
    * otherwise (this.type = 'page')
  **/
  @Input() title: string;
  @Input() id: string;

  private maxFavouriteItems = 10;
  public existingFavouriteItems;

  public list;
  public loading: boolean;
  public displaySuccess: boolean;
  public userLoggedOut: boolean;
  public favouritesDropdown: boolean = false;

  public existingItem: any;
  public existing: boolean;

  public lang: string;
  private redirectUrls = {
    "et": "/toolaud",
    "en": "/dashboard"
  }
  public subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private user: UserService,
    private snackbar: MatSnackBar,
  ) {}

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
       
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  getFavouritesList():void{
    this.loading= true;
    let sub = this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {
     

      if(response['data']['CustomFavorites'].length) {
        this.existingFavouriteItems = response['data']['CustomFavorites'][0]['favorites'];
        this.list = response['data']['CustomFavorites'][0]['favorites'];
      }
      else {
        this.existingFavouriteItems = [];
        this.list = [];
      }

      this.loading = false;
      sub.unsubscribe();
    });
  }
  openDialog(): void {
	  this.dialog.open(Modal, {
		  data: {
        title: this.translate.get('frontpage.favourites_limit_modal_title')['value'].toUpperCase(),
        content: this.translate.get('frontpage.favourites_limit_modal_content')['value'],
        close: this.translate.get('frontpage.favourites_limit_modal_close')['value']
		  }
		});

  }
  compileVariables(){

    let output = {
      lang: this.lang.toUpperCase(),
      title:  this.title
    };

    if(!this.id) {
      output['search_params'] = this.router.url;
      output['type'] = 'search';
    }
    else if(this.id) {
      output['page_id'] = this.id;
      output['type'] = 'page';
    }
    return output;
  }
  removeFavouriteItem(item){
    //console.log(item.targetId);
    let data = { 
      queryId: "deleteFavoriteItem:1",
      variables: { id: item.targetId}
    }

    let sub = this.http.post('/graphql',data).subscribe(response => {
      
      if(response['errors']) {
        console.error('something went terribly wrong');
      } else {
        this.existingItem = false;
        this.existing = false;
        this.snackbar.dismiss();
        //console.log('Page exists: ',this.existing);
      }
      this.getFavouritesList();
      sub.unsubscribe();
    });
  }
  isFavouriteExisting(list){
    let variables = this.compileVariables();
    this.existing = false;
    list.forEach(item => {
      if(item.entity.fieldType == variables['type']){
        switch(variables['type']){
          case 'search': 
            if(item.entity.fieldSearch === variables['search_params']) {
              
              this.existingItem = item;
              this.existing = true; 
              
            } break;
          case 'page':
            if(item.entity.fieldPage.entity.entityUrl.path === this.router.url) {
              this.existing = true; 
              this.existingItem = item;
             
            } break;
        };
      }
    });
  }
  submitFavouriteItem(): void {   
   
    let data = { queryId: "createFavoriteItem:1" }

    data['variables'] = this.compileVariables();
   

    let sub = this.http.post('/graphql', data).subscribe(response => {
      //console.log(response);
      if(response['data']['createFavoriteItem']){

        this.existing = true;
        //console.log('Page exists: ',this.existing);
        this.getFavouritesList();
        this.openFavouriteSnackbar();
      } 
      
      sub.unsubscribe();
    });
  }
  openFavouriteSnackbar() {
    
      let message = `${this.translate.get('frontpage.favourites_snackbar_message')['value']}`;
      let action = `${this.translate.get('frontpage.favourites_snackbar_action')['value']}`;
      let snackBarRef = this.snackbar.open(message, action, {
        duration: 600000,
      });
      snackBarRef.afterDismissed().subscribe((obj) => {
        if (obj.dismissedByAction) {
          this.router.navigateByUrl(this.lang + this.redirectUrls[this.lang]);
        }
      })
    
  }
  /*
  toggleFavouritesPanel(): any {
    
   
    if(this.favouritesDropdown == true) return this.favouritesDropdown = false;
    else this.favouritesDropdown = true;
    
    let sub = this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {
      this.loading = false;
      this.existingFavouriteItems = response['data']['CustomFavorites'][0]['favorites'];
      
      this.isFavouriteExisting( this.existingFavouriteItems);
      console.log(this.existingItem);
      console.log(this.existing);
      if(this.existing === false){
        if( this.existingFavouriteItems.length >= this.maxFavouriteItems) {
          this.openDialog();
          this.favouritesDropdown = false;
        }
      }
      sub.unsubscribe();
    });
  }
  */
  toggleFavouritesButton(){
    this.isFavouriteExisting( this.existingFavouriteItems);
    //console.log('Page exists: ',this.existing);

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
  ngOnInit(){
    this.pathWatcher();

    this.userLoggedOut = this.user.getData()['isExpired'];
    let subscribe = this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {

      if(response['data']['CustomFavorites'].length)
        this.existingFavouriteItems = response['data']['CustomFavorites'][0]['favorites'];
      else this.existingFavouriteItems = [];
      this.isFavouriteExisting( this.existingFavouriteItems);
      //console.log('Page exists: ',this.existing);

    });

    this.subscriptions = [ ...this.subscriptions, subscribe];
  }
  ngOnDestroy(){
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }

    this.snackbar.dismiss()
  }
}
