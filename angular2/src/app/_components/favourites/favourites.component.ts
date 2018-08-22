import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_core/settings';

@Component({
  selector: 'favourites',
  templateUrl: './favourites.template.html',
  styleUrls: ['./favourites.styles.scss']
})

export class FavouritesComponent implements OnInit{
  /** 
    * if (this.id === undefined) then (this.type = 'search') otherwise (this.type = 'page')
  **/
  @Input() title: string;
  @Input() id: string;

  public favouritesDropdown: boolean;
  private lang: string;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpService,
    private settings: SettingsService,
  ) {

  }

  addToFavourites(){
    let routeSubscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );
    routeSubscribe.unsubscribe();    

    let search = this.id ? null : this.router.url;
    let page_id = this.id || null;

    let url = this.settings.url + "/graphql"

    let data = {
      "queryId": "createFavoriteItem:1",
      "variables": {
        "lang": this.lang.toUpperCase(),
        "title": this.title
      }
    }

    if(search) {
      data.variables['search'] = search;
      data.variables['type'] = 'search'
    }
    else if(page_id) {
      data.variables['page_id'] = page_id;
      data.variables['type'] = 'page'
    }

    this.http.post(url, data).subscribe(response => {
      console.log(response);
    });
 
    this.favouritesDropdown = false;
  }

  ngOnInit(){
    console.log('favourites initialized...');
  }
}
