import { Injectable } from '@angular/core';
import { ArticleGraph } from './article.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { RootScopeService } from '../rootScope/rootScope.service';

@Injectable()
export class ArticleService extends ArticleGraph {

  data: any;

  constructor( private apollo: Apollo, private rootScope: RootScopeService ) {
    super();
  }

  getArticle(path, cb): any {

    const query = this.buildSingle( path );

    this.apollo.query({
      query: query,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
      context: {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }
    }).subscribe(({data}) => {
      cb(data);
    });

  }

  getList(offset=0, limit=10, cb): any {

    const lang = this.rootScope.get('currentLang');
    const query = this.buildList(lang, offset,limit);

    this.apollo.query({
      query: query,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
      context: {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }
    }).subscribe(({data}) => {
      cb(data);
    });
  }
}
