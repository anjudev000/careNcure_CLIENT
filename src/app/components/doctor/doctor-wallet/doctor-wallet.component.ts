import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DoctorService } from 'src/app/shared/doctor.service';

interface ApiResponse{
  doctorData:any
}

@Component({
  selector: 'app-doctor-wallet',
  templateUrl: './doctor-wallet.component.html',
  styleUrls: ['./doctor-wallet.component.css']
})
export class DoctorWalletComponent {
  walletSub:Subscription | undefined;
  doctorId:string = '';
  walletAmount:number =0;
  constructor(
    private doctorService:DoctorService,
    private _dialoRef: MatDialogRef<DoctorWalletComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { doctorId: string}

  ){
    this.doctorId = data.doctorId;
    this.walletSub = this.doctorService.getDoctorDetails(this.doctorId).subscribe({

      next:(res)=>{
        const resp = ((res as ApiResponse).doctorData);
        this.walletAmount = resp.wallet; 
      }
    })
  }
  ngOnDestroy(){
    if(this.walletSub){
      this.walletSub.unsubscribe();
    }
  }
}
