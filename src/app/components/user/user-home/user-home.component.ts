import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs';

interface UserProfileResponse{
  user:any;
}

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent {
userDetails:any;
subData : Subscription | undefined;
constructor(private userservice:UserService,private router:Router){}

ngOnInit(){
  this.subData = this.userservice.getUserProfile().subscribe({
    next:(res)=>{
      this.userDetails = (res as UserProfileResponse).user;
    },
    error:(err)=>{
      console.log(err.message);
    }
   } )
}

ngOnDestroy(){
  if(this.subData){
    this.subData.unsubscribe();
  }
}

}
