import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


interface userIdRes{
  userId:string
}
interface newPasswordData {
  userId: string;
  newPassword: string;
}

@Component({
  selector: 'app-user-reset-password',
  templateUrl: './user-reset-password.component.html',
  styleUrls: ['./user-reset-password.component.css']
})
export class UserResetPasswordComponent {

  errorMessages!:string;
  passResetSub : Subscription |undefined;
  updatepasssSub: Subscription | undefined;
  
  constructor(private userService:UserService,
    private _snackBar: MatSnackBar,
    private router:Router
  
    ){}
  handlepasswordResetSubmit(data:any){
   this.passResetSub =  this.userService.getUserIdfromPasswordToken(data.token).subscribe({
      next:(res)=>{
        const userId = ((res as userIdRes).userId);
        this.updatePassword(userId,data.password)
      },
      error:(err)=>{
        console.log("error getting userId",err.error.message);
      }
  })
  }

  updatePassword(userId:string,newPassword:string){
    const newPasswordData:newPasswordData = {userId,newPassword}
    this.updatepasssSub = this.userService.postNewPassword(newPasswordData).subscribe({
      next:(res)=>{
        this._snackBar.open('Password Changed Successfully','close',{duration:3000});
        this.router.navigate(['/user-login']);
      },
      error:(err)=>{
        if (err.error && err.error.message) {
          // Display the error message from the server response
          this.errorMessages = err.error.message;
        } else {
          // Handle generic error if there's no specific error message
          this.errorMessages = 'An error occurred while updating the password.';
        }
        this._snackBar.open(this.errorMessages,'Close',{duration:3000});
      }
  })
  }

  ngOnDestroy(){
    if(this.passResetSub){
      this.passResetSub.unsubscribe();
    }
    if(this.updatepasssSub){
      this.passResetSub?.unsubscribe();
    }
  }

}
