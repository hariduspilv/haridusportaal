import { Component, OnInit, Input } from '@angular/core';
import { FavouritesComponent } from '@app/_components/favourites/favourites.component'
@Component({
  selector: 'favouritesList',
  templateUrl: './favouritesList.template.html',
  styleUrls: ['./favouritesList.styles.scss']
})

export class FavouritesListComponent extends FavouritesComponent implements OnInit{
  
  

  constructor() {
    super(null,null,null,null,null,null)
  }

  ngOnInit(){
    this.getFavouritesList().subscribe(list => {
      console.log('LIST');
      console.log(list);
    });
    console.log(this.list)
  }
}
