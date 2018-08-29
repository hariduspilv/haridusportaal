import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/_services/userService';

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"]
})

export class DashboardComponent implements OnInit{
  public mainMenu = [ {link: '/applications', label: 'Taotlused'},
                      {link: '/certificates', label: 'Tunnistused'},
                      {link: '/student', label: 'Õpingud'},
                      {link: '/teacher', label: 'Õpetan'}  ];
  public userData;

  constructor(
    private user: UserService
  ){

  }
  ngOnInit(){
    this.userData = this.user.getData();
    console.log(this.userData);
  }
}