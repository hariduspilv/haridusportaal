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
  address: any;
  studyInstitutionType: string;
  ownershipType: string;
  ownerType: string;
  name: string;
  nameENG: string;
  lang: any;
  loader: boolean = false;
  formOptions: {} = {
    ownerTypes: [],
    ownershipTypes: [],
    studyInstitutionTypes: []
  };
  response: any;

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
    // this.addressService.addressAutocomplete('E. Vilde tee 125', 300, 'addressVal', false, 10, 1, 1);
    this.getOptions();
    if(this.data.edId) {
      this.contactPhone = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.contactPhone ? this.data.institutionInfo.contacts.contactPhone : "";
      this.contactEmail = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.contactEmail ? this.data.institutionInfo.contacts.contactEmail : "";
      this.webpageAddress = this.data.institutionInfo.contacts && this.data.institutionInfo.contacts.webpageAddress ? this.data.institutionInfo.contacts.webpageAddress : "";
      this.address = this.data.institutionInfo.address || "";
      this.form = this.fb.group({
        contactPhone: [this.contactPhone, []],
        contactEmail: [this.contactEmail, [Validators.email]],
        webpageAddress: [this.webpageAddress, []],
        address: [this.address, []]
      });
    } else {
      this.form = this.fb.group({
        contactPhone: [this.contactPhone, [Validators.required]],
        contactEmail: [this.contactEmail, [Validators.required, Validators.email]],
        webpageAddress: [this.webpageAddress, [Validators.required]],
        address: [this.address, [Validators.required]],
        name: [this.name, [Validators.required]],
        nameENG: [this.nameENG, []],
        ownerType: [this.ownerType, [Validators.required]],
        ownershipType: [this.ownershipType, [Validators.required]],
        studyInstitutionType: [this.studyInstitutionType, [Validators.required]]
      });
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
    // this.loader = true;
    console.log('ADDING');
    console.log(this.form.controls);
    // let data = { 
    //   edId: "",
    //   address: {},
    //   general: { 
    //     "name": this.form.controls.name.value,
    //     "nameENG": this.form.controls.nameENG.value,
    //     "ownerType": this.form.controls.ownerType.value,
    //     "ownershipType": this.form.controls.ownershipType.value,
    //     "studyInstitutionType": this.form.controls.studyInstitutionType.value
    //   },
    //   contacts: {
    //     "contactPhone" : this.form.controls.contactPhone.value,
    //     "contactEmail": this.form.controls.contactEmail.value,
    //     "webpageAddress": this.form.controls.webpageAddress.value
    //   }
    //   // lang: this.data.lang.toUpperCase()
    // }
    // const add = this.http.post('/educational-institution/add', data).subscribe((response) => {
    //   let data = response['data'];
    //   console.log(data);
    //   this.loader = false;
    // }, (data) => {
    //   this.loader = false;
    // });
  }
  
  
  edit() {
    console.log('EDITING');
    console.log(this.form.controls);
    this.loader = true;
    let data = { 
      edId: this.data.edId,
      address: this.form.controls.address.value,
      contacts: {
        "contactPhone" : this.form.controls.contactPhone.value,
        "contactEmail": this.form.controls.contactEmail.value,
        "webpageAddress": this.form.controls.webpageAddress.value
      }
      // lang: this.data.lang.toUpperCase()
    }
    const edit = this.http.post('/educational-institution/edit', data).subscribe((response) => {
      let data = response['data'];
      console.log(data);
      this.loader = false;
    }, (data) => {
      this.loader = false;
    });
  }
  
  close() {
    this.dialogRef.close();
  }
  
  clear() {
    this.form.reset();
  }

  isInvalidField(field): boolean {
    return this.form.controls[field].invalid && this.form.controls[field].value && this.form.controls[field].dirty
  }
}
