import { Component, OnInit, Input } from '@angular/core';
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

  protected list;
  protected loading: boolean;

  public userLoggedOut: boolean;
  public favouritesDropdown: boolean = false;
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
  submitFavouriteItem(): void {

    let routeSubscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );
    routeSubscribe.unsubscribe();    

    let search = this.id ? null : this.router.url;
    let page_id = this.id || null;

    let data = {
      queryId: "createFavoriteItem:1",
      variables: {
        lang: this.lang.toUpperCase(),
        title: this.title
      }
    }

    if(search) {
      data.variables['search_params'] = search;
      data.variables['type'] = 'search'
    }
    else if(page_id) {
      data.variables['page_id'] = page_id;
      data.variables['type'] = 'page'
    }

    this.http.post('/graphql', data).subscribe(response => {
      console.log(response);
    });
 
    this.favouritesDropdown = false;
  }
  
  toggleFavouritesPanel(): any {
    
    if(this.favouritesDropdown == true) return this.favouritesDropdown = false;
   
    this.http.get('/graphql?queryId=customFavorites:1').subscribe(response => {
      let favouriteItems = response['data']['CustomFavorites'][0]['favorites'];
      console.log(favouriteItems);
      if(favouriteItems.length < this.maxFavouriteItems) {
        this.favouritesDropdown = true;
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
