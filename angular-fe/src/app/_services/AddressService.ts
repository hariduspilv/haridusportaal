import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AddressService {
  public resultSet: any;
  public debouncer: any;
  public subscription: Subscription;
  public autocompleteLoader: boolean = true;
  public addressFieldFocus: boolean = false;
  public addressSelectionValue: {} = {};
  public previousSearch: string = '';

  constructor(private http: HttpClient) {}

  addressAutocomplete(searchText, debounceTime, selectOnMatch, limit: number, ihist: number, apartment: number) {
    if(searchText.length < 3) {
      this.addressSelectionValue = {};
      return;
    }
    if(this.previousSearch === searchText) {
      return;
    }
    this.previousSearch = searchText;

    if(this.debouncer) clearTimeout(this.debouncer)
    if(this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
      this.autocompleteLoader = true;
      let url = 'http://inaadress.maaamet.ee/inaadress/gazetteer?ihist='+ ihist +'&appartment='+ apartment +'&address=' + searchText + '&results='+ limit + '&callback=JSONP_CALLBACK';
      
      const subscription = this.http.get(url).subscribe((response: any) => {
        this.autocompleteLoader = false;
        this.resultSet = response['addresses'] || [];
        this.resultSet = this.resultSet.filter(address => (address.kood6 != '0000' || address.kood7 != '0000'))
        this.resultSet.forEach(address => {
          if (address.kort_nr) {
            address.addressHumanReadable = address.pikkaadress + '-' + address.kort_nr;
          } else {
            address.addressHumanReadable = address.pikkaadress;
          }
        })
        if (!this.resultSet.length) {
          this.addressSelectionValue = null;
        }
        if(selectOnMatch){
          this.addressAutocompleteSelectionValidation(searchText);
        }
        subscription.unsubscribe();
      });
  }
  
  addressAutocompleteSelectionValidation(humanReadable) {
    if(this.resultSet === undefined) return false;  
    let match = this.resultSet.find(address => {
      return address.addressHumanReadable === humanReadable
    });
    if(!match) {
      this.resultSet = undefined;
      this.addressSelectionValue = null;
    } else {
      this.addressSelectionValue = this.inAdsFormatValue(match);
    }
  }

  validateInAdsField(element){
    if (!this.addressFieldFocus) {
      this.addressAutocompleteSelectionValidation(element)
    }
  }

  inAdsFormatValue(address){
    if(address.apartment != undefined) return address;
    return {
      "seqNo": address.unik || '',
      "adsId" : address.adr_id || '',
      "adsOid" : address.ads_oid || '',
      "klElukoht": address.tehn_id2 || '',
      "addressFull": address.pikkaadress || '',
      "addressCoded" : address.koodaadress || '',
      "county" : address.maakond || '',
      "countyEHAK" : address.ehakmk || '',
      "localGovernment" : address.omavalitsus || '',
      "localGovernmentEHAK" : address.ehakov || '',
      "settlementUnit" : address.asustusyksus || '',
      "settlementUnitEHAK" : address.ehak || '',
      "address" : address.aadresstekst || '',
      "apartment" : address.kort_nr || '',
      "addressHumanReadable" : address.addressHumanReadable || address.pikkaadress,
      }
  }
  
}