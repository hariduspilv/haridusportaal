import { Component, OnInit } from '@angular/core';
import { FavouritesComponent } from '@app/_components/favourites/favourites.component';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'favouritesList',
  templateUrl: './favouritesList.template.html',
  styleUrls: ['./favouritesList.styles.scss']
})

export class FavouritesListComponent extends FavouritesComponent implements OnInit{
  
  constructor( http: HttpService ) {
    super(
      null,
      null,
      http,
      null,
      null,
      null,
      null)
  }

  ngOnInit(){    
    this.getFavouritesList();
  }
}
