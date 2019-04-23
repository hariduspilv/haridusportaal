import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_services/settings.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'search-modal',
  templateUrl: 'search.modal.html',
  styleUrls: ['../modal/modal.scss', 'search.modal.scss']
})

export class SearchModal {
  public suggestionSubscription: Subscription;
  public suggestionList: any = false;
  public debouncer: any;
  public autocompleteLoader: boolean = false;
  public searchParam: any;

  constructor(
    private router: Router,
    private http: HttpService,
    private settings: SettingsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SearchModal>
  ){}

  searchRoute(searchParam) {
    if (!searchParam) {searchParam = ''}
    let url = "/otsing?term=" + searchParam;
    this.searchParam = '';
    this.router.navigateByUrl(url);
    this.closeModal();
  }

  populateSuggestionList(searchText, debounceTime) {

    if( !searchText ){ searchText = ''; }

    if(searchText.length < 3) {
      clearTimeout(this.debouncer);
      this.suggestionList = [];
      return;
    }
    if(this.debouncer) clearTimeout(this.debouncer)
    if(this.suggestionSubscription !== undefined) {
      this.suggestionSubscription.unsubscribe();
    }
    this.debouncer = setTimeout(_ => {
      this.autocompleteLoader = true;

      let variables = {
        search_term: searchText
      }
      this.suggestionSubscription = this.http.get('testAutocomplete', {params:variables}).subscribe(res => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    }, debounceTime)
  }

  closeModal() {
    this.dialogRef.close();
  }
  
}
