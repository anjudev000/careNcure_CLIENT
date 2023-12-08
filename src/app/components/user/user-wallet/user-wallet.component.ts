import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/shared/user.service';
import { Subscription } from 'rxjs';


interface ApiResponse{
  userWalletAmount:number
}
interface logResponse{
  logs:string[];
}

@Component({
  selector: 'app-user-wallet',
  templateUrl: './user-wallet.component.html',
  styleUrls: ['./user-wallet.component.css']
})
export class UserWalletComponent {

  userId:string ='';
  walletAmount:number = 0;
  transactionLogs:string[] = [];
  walletSub: Subscription |undefined;
  transactionSub: Subscription | undefined;
  constructor(
    private userService:UserService,
    private _dialoRef: MatDialogRef<UserWalletComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string }
  ){
    this.userId = data.userId;
    this.walletSub = this.userService.getWallet(this.userId).subscribe({
      next:(res)=>{
        this.walletAmount = ((res as ApiResponse).userWalletAmount);
        console.log(this.walletAmount);
        
      }
    })
   this.transactionSub =  this.userService.getAllTransactions(this.userId).subscribe({
      next:(res)=>{
          // Ensure the response is an array before assigning
          if (Array.isArray(res)) {
            this.transactionLogs = res;
            console.log('Transaction Logs:', this.transactionLogs);
          } else {
            console.error('Invalid logs response:', res);
          }
      }
    })
   }

   ngOnDestroy(){
    if(this.walletSub){
      this.walletSub.unsubscribe();
    }
    if(this.transactionSub){
      this.transactionSub.unsubscribe();
    }
   }
 
}
