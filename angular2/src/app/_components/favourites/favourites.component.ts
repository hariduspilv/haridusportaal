import { Component, OnInit, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Observable, Subscription } from '../../../../node_modules/rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/_services/userService'
@Component({
  selector: 'favourites',
  templateUrl: './favourites.template.html',
  styleUrls: ['./favourites.styles.scss']
})

export class FavouritesComponent implements OnInit{
  /** 
    * if (this.id === undefined)
    * then (this.type = 'search')
    * otherwise (this.type = 'page')
  **/
  @Input() title: string;
  @Input() id: string;

  private maxFavouriteItems = 10;

  public list;
  public loading: boolean;

  public userLoggedOut: boolean;
  public favouritesDropdown: boolean = false;
  public existingTargetId: any;
  public existing: boolean;
  private lang: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private user: UserService
  ) {

  }
  getFavouritesList():void{
    this.loading= true;
    this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {
      this.list = response['data']['CustomFavorites'][0]['favorites'];
     console.log(this.list);
      this.loading = false;
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
    let routeSubscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );
    routeSubscribe.unsubscribe(); 

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
  removeFavouriteItem(id){
    let data = { 
      queryId: "deleteFavoriteItem:1",
      variables: { id: id}
    }

    let sub = this.http.post('/graphql',data).subscribe(response => {
      console.log(response);
      this.existingTargetId = false;
      this.existing = false;
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
              this.existingTargetId = item.targetId;
              this.existing = true;
            } break;
          case 'page':
            if(item.entity.fieldPage.entity.entityUrl.path === this.router.url) {
              this.existingTargetId = item.targetId;
              this.existing = true;
            } break;
        };
      }
    });
  }
  submitFavouriteItem(): void {   

    let data = { queryId: "createFavoriteItem:1" }

    data['variables'] = this.compileVariables();
   

    let sub = this.http.post('/graphql', data).subscribe(response => {
      console.log(response);
      //todo: display success
      sub.unsubscribe();
    });
  
 
    this.favouritesDropdown = false;
  }
  
  toggleFavouritesPanel(): any {
    this.loading = true;
   
    if(this.favouritesDropdown == true) return this.favouritesDropdown = false;
    else this.favouritesDropdown = true;

    this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {
      this.loading = false;
      let existingFavouriteItems = response['data']['CustomFavorites'][0]['favorites'];
      if(existingFavouriteItems.length < this.maxFavouriteItems) {
       
        this.isFavouriteExisting(existingFavouriteItems);
      }
      else {
        this.openDialog();
      }
    });
  }

  ngOnInit(){
    this.userLoggedOut = this.user.getData()['isExpired'];
  }
}
