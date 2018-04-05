import { Injectable } from '@angular/core';
import { ArticleGraph } from './article.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ArticleService extends ArticleGraph {

  data: any;

  constructor( private apollo: Apollo ) {
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

  getList() {
    // asd
  }
}
