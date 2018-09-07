import { Component, OnInit } from '@angular/core';
import { FavouritesComponent } from '@app/_components/favourites/favourites.component';
import { HttpService } from '@app/_services/httpService';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'favouritesList',
  templateUrl: './favouritesList.template.html',
  styleUrls: ['./favouritesList.styles.scss']
})

export class FavouritesListComponent extends FavouritesComponent implements OnInit{
  
  constructor( http: HttpService, snackbar: MatSnackBar) {
    super(
      null,
      null,
      http,
      null,
      null,
      null,
      snackbar)
  }

  ngOnInit(){    
    this.getFavouritesList();
  }
}
