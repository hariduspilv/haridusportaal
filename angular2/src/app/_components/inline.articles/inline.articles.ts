import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  selector: 'inline-articles',
  templateUrl: './inline.articles.html',
  styleUrls: ['./inline.articles.scss']
})

export class InlineArticlesComponent {
  @Input() heading: string = '';
  @Input() generalLink: object;
  @Input() content: object;
  @Input() contentLabels: Object;
 
  public lang: string;
  public loading: boolean = false;

  constructor(private rootScope: RootScopeService,
    private http: HttpService,
    public route: ActivatedRoute) {}
   
  ngOnInit() {
    const { heading, generalLink, content, contentLabels } = this;
    // console.log(heading, generalLink, content, contentLabels);
  }
  
}
