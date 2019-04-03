import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  selector: 'articles-triple',
  templateUrl: './articles.triple.html',
  styleUrls: ['./articles.triple.scss']
})

export class ArticlesTripleComponent {
 
  public lang: string;
  public loading: boolean = false;

  constructor(private rootScope: RootScopeService,
    private http: HttpService,
    public route: ActivatedRoute) {}
   
  
}
