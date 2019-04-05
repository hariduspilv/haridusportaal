import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  selector: 'inline-links',
  templateUrl: './inline.links.html',
  styleUrls: ['./inline.links.scss']
})

export class InlineLinksComponent {
  @Input() content: Array<object>;
  @Input() contentLabels: object;
  @Input() externalImage: object;
 
  public lang: string;
  public loading: boolean = false;

  constructor(private rootScope: RootScopeService,
    private http: HttpService,
    public route: ActivatedRoute) {}
   
  ngOnInit() {
    const { content, contentLabels, externalImage } = this;
    if (content && content.length && externalImage && externalImage['standard'] && !contentLabels['image']) {
      contentLabels['image'] = 'image';
      content.forEach(elem => elem['image'] = externalImage['standard']);
    }
  }
  
}
