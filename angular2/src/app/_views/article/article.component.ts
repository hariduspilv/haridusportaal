import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '../../_services';

import { Subscription } from 'rxjs/Subscription'; 

import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { VideoComponent } from '@app/_components/video/video.component';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';

@Component({
  selector: "article-component",
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})

export class ArticleComponent implements OnInit, OnDestroy{

  @Input() inputData: any;

  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  private userLoggedOut: boolean = false;
  
  content: any;
  error: boolean;
  
  accordionOpenState: boolean = false;
  accordionSection: any[];
  
  fieldRightSidebar: any;

  fieldAdditional: any;
  fieldAdditionalTitle: any;
  fieldAdditionalBody: any;
  
  fieldContactSection: any;
  fieldContactPerson: any;
  fieldContactPhone: any;
  fieldContactEmail: any;
  fieldContactOrganization: any;
  accordionHeight: "'2.5rem'";
  
  articleLinks: any[];
  relatedArticles: any[];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rootScope: RootScopeService,
    private http: HttpService,
    private user: UserService
    ) {}
  
  parseData( data ){
    
    data = data['entity'] || data;
    this.content = data;
    this.accordionSection = data['fieldAccordionSection'];
    this.fieldRightSidebar = data['fieldRightSidebar'];
    
    if (this.fieldRightSidebar !== null) {
      
      this.fieldRightSidebar = data['fieldRightSidebar']['entity'];
      
      this.fieldContactSection = this.fieldRightSidebar['fieldContactSection'];
      this.fieldAdditional = this.fieldRightSidebar['fieldAdditional'];
      this.articleLinks = this.fieldRightSidebar['fieldHyperlinks'];
      this.relatedArticles = this.fieldRightSidebar['fieldRelatedArticle'];        
      
      if(this.fieldAdditional !== null) {
        
        this.fieldAdditional = this.fieldRightSidebar['fieldAdditional']['entity'];
        this.fieldAdditionalTitle = this.fieldAdditional['fieldTitle'];
        this.fieldAdditionalBody = this.fieldAdditional['fieldAdditionalBody'];
      }
      
      if(this.fieldContactSection !== null) {
        
        this.fieldContactSection = this.fieldRightSidebar['fieldContactSection']['entity'];
        this.fieldContactPerson = this.fieldContactSection['fieldPerson'];
        this.fieldContactPhone = this.fieldContactSection['fieldPhone'];
        this.fieldContactEmail = this.fieldContactSection['fieldEmail'];
        this.fieldContactOrganization = this.fieldContactSection['fieldOrganization'];
      }
    }
  }
  ngOnInit() {

    this.route.data.subscribe(v => console.log(v));

    if( this.inputData ){
      this.parseData( this.inputData );
    }else{
      this.route.params.subscribe(
        (params: ActivatedRoute) => {
          this.lang = this.rootScope.get("lang");

          let variables = {
            "path": this.router.url
          };
  
          this.content = false;
          this.accordionSection = [];
          this.fieldRightSidebar = false;

          this.querySubscription = this.http.get('getArticle', { params: variables } )
          .subscribe( (response) => {
            this.userLoggedOut = this.user.getData()['isExpired'];
            let data = response['data']['route'];
            this.parseData( data );
          });
        }
      )
    }
    
  }
  
  ngOnDestroy() {
    if( this.querySubscription ){
      this.querySubscription.unsubscribe();
    }
  }
  
}