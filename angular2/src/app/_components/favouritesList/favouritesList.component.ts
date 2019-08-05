import { Component, OnInit, OnDestroy } from '@angular/core';
import { FavouritesComponent } from '@app/_components/favourites/favourites.component';
import { HttpService } from '@app/_services/httpService';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services';
import { UserService } from '@app/_services/userService';
@Component({
  selector: 'favouritesList',
  templateUrl: './favouritesList.template.html',
  styleUrls: ['./favouritesList.styles.scss']
})

export class FavouritesListComponent extends FavouritesComponent implements OnInit{
  
  constructor( 
    public http: HttpService, public snackbar: MatSnackBar, public route: ActivatedRoute, public rootScope: RootScopeService, public userService: UserService) {
    super(
      null,
      null,
      http,
      null,
      null,
      snackbar,
      rootScope,
      userService)
  }

  ngOnInit(){
    this.getFavouritesList();
  }
}
