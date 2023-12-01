import { Component } from '@angular/core';
import { DoctorService } from 'src/app/shared/doctor.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

interface doctorIdRes{
  doctorId:string
}
interface newPasswordData {
  doctorId: string;
  newPassword: string;
}

@Component({
  selector: 'app-doctor-reset-password',
  templateUrl: './doctor-reset-password.component.html',
  styleUrls: ['./doctor-reset-password.component.css']
})
export class DoctorResetPasswordComponent {
  subData1:Subscription | undefined;
  subData2:Subscription | undefined;
  errorMessages!:string;

  constructor(private route:Router,
    private doctorService:DoctorService,
    private _snackBar: MatSnackBar,

    ){}

    handlepasswordReset(data:any){
      this.subData1 = this.doctorService.getUserIdfromPasswordToken(data.token).subscribe(
        res=>{
          const doctorId = ((res as doctorIdRes).doctorId);
          this.updatePassword(doctorId,data.password)
          
        },
        err=>{
          console.log("error getting doctorId",err.error.message);

        }
      )
    }
    updatePassword(doctorId:string,newPassword:string){
      const newPasswordData:newPasswordData={doctorId,newPassword}
     this.subData2 =  this.doctorService.postNewPassword(newPasswordData).subscribe(
        res=>{
          this._snackBar.open('Password Changed Successfully','close',{duration:3000});
          this.route.navigate(['/doctor-login']);
        },
        err=>{
          if (err.error && err.error.message) {
            // Display the error message from the server response
            this.errorMessages = err.error.message;
          } else {
            // Handle generic error if there's no specific error message
            this.errorMessages = 'An error occurred while updating the password.';
          }
          this._snackBar.open(this.errorMessages,'Close',{duration:3000});
  
        }
      )
    }
    ngOnDestroy(){
      if(this.subData1){
        this.subData1.unsubscribe();
      }
      if(this.subData2){
        this.subData2.unsubscribe();
      }
    }
}
