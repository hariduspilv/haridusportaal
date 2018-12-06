import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {SettingsService} from '@app/_core/settings';
import {HttpService} from '@app/_services/httpService';
import {AddressService} from '@app/_services/addressService';
@Component({
  selector: 'dashboard-form-dialog',
  templateUrl: 'dashboard.form.dialog.html',
  styleUrls: ['../modal/modal.scss']
})
export class DashboardFormDialog {
  
  form: FormGroup;
  contactPhone: string;
  contactEmail: string;
  webpageAddress: string;
  addressInvalid: boolean = false;
  address: any;
  studyInstitutionType: string;
  ownershipType: string;
  ownerType: string;
  name: string;
  nameENG: string;
  lang: any;
  loader: boolean = false;
  actionSuccess: boolean = false;
  reqError: boolean = false;
  formOptions: {} = {
    ownerTypes: [],
    ownershipTypes: [],
    studyInstitutionTypes: []
  };
  response: any;
  initialized: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DashboardFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public router: Router,
    public route: ActivatedRoute,
    public settings: SettingsService,
    private http: HttpService,
    private addressService: AddressService
  ) { }
  
  
  ngOnInit() {
    this.getOptions();
    if(this.data.edId) {
      this.contactPhone = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.contactPhone ? this.data.institutionInfo.contacts.contactPhone : "";
      this.contactEmail = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.contactEmail ? this.data.institutionInfo.contacts.contactEmail : "";
      this.webpageAddress = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.webpageAddress ? this.data.institutionInfo.contacts.webpageAddress : "";
      this.address = this.data.institutionInfo.address.addressHumanReadable || "";
      this.form = this.fb.group({
        contactPhone: [this.contactPhone, []],
        contactEmail: [this.contactEmail, [Validators.pattern]],
        webpageAddress: [this.webpageAddress, [Validators.pattern]],
        address: [this.address, []]
      });
    } else {
      this.form = this.fb.group({
        contactPhone: [this.contactPhone, [Validators.required]],
        contactEmail: [this.contactEmail, [Validators.required, Validators.pattern]],
        webpageAddress: [this.webpageAddress, [Validators.required]],
        address: [this.address, [Validators.required, Validators.pattern]],
        name: [this.name, [Validators.required]],
        nameENG: [this.nameENG, []],
        ownerType: [this.ownerType, [Validators.required]],
        ownershipType: [this.ownershipType, [Validators.required]],
        studyInstitutionType: [this.studyInstitutionType, [Validators.required]]
      });
      this.initialized = true;
    }
  }  

  ngAfterViewInit() {
    if (this.address && !this.initialized) {
      this.addressService.addressAutocomplete(this.address, 300, true, 10, 1, 1)
      this.initialized = true;
    }
  }
  
  getOptions() {
    this.loader = true;
    const add = this.http.get('/educational-institution/data').subscribe((response) => {

      Object.values(response['ownershipType']).forEach((elem, index) => {
        elem['id'] = Object.keys(response['ownershipType'])[index];
        this.formOptions['ownershipTypes'].push(elem);
      });
      Object.values(response['ownerType']).forEach((elem, index) => {
        elem['id'] = Object.keys(response['ownerType'])[index];
        this.formOptions['ownerTypes'].push(elem);
      });
      Object.values(response['studyInstitutionType']).forEach((elem, index) => {
        elem['id'] = Object.keys(response['studyInstitutionType'])[index];
        this.formOptions['studyInstitutionTypes'].push(elem);
      });
      this.loader = false;

    }, (data) => {
      this.loader = false;
    });
  }

  add() {
    let addressVal = this.addressService.addressSelectionValue || null;
    if (!addressVal) {
      this.addressInvalid = true;
      this.reqError = true;
      return false; 
    }
    this.loader = true;
    this.reqError = false;
    let data = { 
      address: addressVal,
      general: { 
        "name": this.form.controls.name.value,
        "nameENG": this.form.controls.nameENG.value,
        "ownerType": this.form.controls.ownerType.value,
        "ownershipType": this.form.controls.ownershipType.value,
        "studyInstitutionType": this.form.controls.studyInstitutionType.value
      },
      contacts: {
        "contactPhone" : this.form.controls.contactPhone.value,
        "contactEmail": this.form.controls.contactEmail.value,
        "webpageAddress": this.form.controls.webpageAddress.value
      }
    }
    const add = this.http.post('/educational-institution/add', data).subscribe((response) => {
      this.actionSuccess = true;
      this.loader = false;
    }, (data) => {
      this.reqError = true;
      this.loader = false;
    });
  }
  
  edit() {
    let addressVal = this.addressService.addressSelectionValue || null;
    if (!addressVal) {
      this.addressInvalid = true;
      this.reqError = true;
      return false; 
    }
    this.loader = true;
    this.reqError = false;
    let data = { 
      edId: this.data.edId,
      address: addressVal,
      contacts: {
        "contactPhone" : this.form.controls.contactPhone.value,
        "contactEmail": this.form.controls.contactEmail.value,
        "webpageAddress": this.form.controls.webpageAddress.value
      }
    }
    const edit = this.http.post('/educational-institution/edit', data).subscribe((response) => {
      this.actionSuccess = true;
      this.loader = false;
    }, (data) => {
      this.reqError = true;
      this.loader = false;
    });
  }
  
  close() {
    this.dialogRef.close(this.actionSuccess);
  }
  
  clear() {
    this.form.reset();
  }

  isInvalidField(field): boolean {
    return this.form.controls[field].invalid && this.form.controls[field].value && this.form.controls[field].dirty
  }
  
  loseFocus(event) {
    if (!event) {(document.activeElement as HTMLElement).blur();}
  }
}
