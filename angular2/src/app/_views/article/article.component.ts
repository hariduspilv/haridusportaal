import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { ArticleService, RootScopeService } from '../../_services';
import { getArticleData } from '../../_services/article/article.graph';


import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription'; 

import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';

@Component({
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})

export class ArticleComponent implements OnInit, OnDestroy{
  
  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  
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
  
  articleLinks: any[];
  relatedArticles: any[];
  
  constructor(private router: Router, private route: ActivatedRoute, private articleService: ArticleService, private rootScope: RootScopeService, private apollo: Apollo) {}
  
  ngOnInit() {
    
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        this.querySubscription = this.apollo.watchQuery({
          query: getArticleData,
          variables: {
            path: this.path,
            lang: this.lang.toUpperCase(),
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })
        .valueChanges
        .subscribe(({data, loading}) => {
          
          //language service
          const langOptions = data['route']['languageSwitchLinks'];
          let langValues = {};
          for( var i in langOptions ){
            langValues[langOptions[i].language.id] = langOptions[i].url.path;
          }
          this.rootScope.set('langOptions', langValues);
          //language service
          
          this.content = data['route']['entity'];
          this.accordionSection = data['route']['entity']['fieldAccordionSection'];
          this.fieldRightSidebar = data['route']['entity']['fieldRightSidebar'];
          
          if (this.fieldRightSidebar !== null) {
            
            this.fieldRightSidebar = data['route']['entity']['fieldRightSidebar']['entity'];
            
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
        });
      }
    )
    
  }
  
  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
  
}