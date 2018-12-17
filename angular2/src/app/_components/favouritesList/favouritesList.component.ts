import { Component, OnInit, OnDestroy } from '@angular/core';
import { FavouritesComponent } from '@app/_components/favourites/favourites.component';
import { HttpService } from '@app/_services/httpService';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'favouritesList',
  templateUrl: './favouritesList.template.html',
  styleUrls: ['./favouritesList.styles.scss']
})

export class FavouritesListComponent extends FavouritesComponent implements OnInit{
  
  constructor( 
    public http: HttpService, public snackbar: MatSnackBar, public route: ActivatedRoute) {
    super(
      null,
      null,
      http,
      null,
      null,
      null,
      snackbar,
      null)
  }

  ngOnInit(){
    this.getFavouritesList();
  }
}
