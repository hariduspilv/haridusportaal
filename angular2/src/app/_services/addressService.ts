import { Component, Output, Injectable} from '@angular/core';
import { Jsonp } from '@angular/http';

@Injectable()
export class AddressService {
  public autoCompleteContainer = {};
  public autocompleteDebouncer = {};
  public autocompleteSubscription = {};
  public autocompleteLoader: boolean = true;
  public addressFieldFocus: boolean = false;

  constructor(private _jsonp: Jsonp) {}

  addressAutocomplete(searchText: string, debounceTime: number = 300, element, autoselectOnMatch: boolean = false, limit: number, ihist: number, apartment: number) {
    console.log('woah');
    if(searchText.length < 3) return;

    if(this.autocompleteDebouncer[element]) clearTimeout(this.autocompleteDebouncer[element])
    
    if(this.autocompleteSubscription[element] !== undefined) {
      this.autocompleteSubscription[element].unsubscribe();
    }
  
    let _this = this;
    
    this.autocompleteDebouncer[element] = setTimeout(_ => {
      _this.autocompleteLoader = true;
      let url = 'http://inaadress.maaamet.ee/inaadress/gazetteer?ihist='+ ihist +'&appartment='+ apartment +'&address=' + searchText + '&results='+ limit + '&callback=JSONP_CALLBACK';
      let jsonp = _this._jsonp.get(url).map(function(res){
        return res.json() || {};
      });
    
      _this.autocompleteSubscription[element] = jsonp.subscribe(data => {
        // if(data['error']) { _this.errorHandler('Something went wrong with In-ADS request') }
        _this.autocompleteLoader = false;
        _this.autoCompleteContainer[element] = data['addresses'] || [];
        _this.autoCompleteContainer[element] = _this.autoCompleteContainer[element].filter(address => (address.kood6 != '0000' || address.kood7 != '0000'))
        _this.autoCompleteContainer[element].forEach(address => {
          if(address.kort_nr){
            address.addressHumanReadable = address.pikkaadress + '-' + address.kort_nr;
          } else {
            address.addressHumanReadable = address.pikkaadress;
          }
        })
        // if(autoselectOnMatch === true){
        //   _this.addressAutocompleteSelectionValidation(element);
        // }
        _this.autocompleteSubscription[element].unsubscribe();
        console.log(_this.autoCompleteContainer);
      })  

    }, debounceTime)

  }
  
  // addressAutocompleteSelectionValidation(element) {
  //   if(this.autoCompleteContainer[element] ===  undefined) {
  //     return this.temporaryModel[element] = null;
  //   }   

  //   let match = this.autoCompleteContainer[element].find(address => {
  //     return address.addressHumanReadable == this.temporaryModel[element]
  //   })
   
  //   if(!match) {
  //     this.autoCompleteContainer[element] = null;
  //     this.temporaryModel[element] = null;
  //     this.data_elements[element].value = null;
  //   }
  //   else {
  //     this.data_elements[element].value = this.inAdsFormatValue(match)
  //   }
  // }

  inAdsFormatValue(address){
    if(address.apartment != undefined) return address;
    return {
      "adr_id" : address.adr_id,
      "ads_oid" : address.ads_oid,
      "addressCoded" : address.koodaadress,
      "county" : address.maakond,
      "countyEHAK" : address.ehakmk,
      "localGovernment" : address.omavalitsus,
      "localGovernmentEHAK" : address.ehakov,
      "settlementUnit" : address.asustusyksus,
      "settlementUnitEHAK" : address.ehak,
      "address" : address.aadresstekst,
      "apartment" : address.kort_nr,
      "addressHumanReadable" : address.addressHumanReadable
      }
  }
  
}