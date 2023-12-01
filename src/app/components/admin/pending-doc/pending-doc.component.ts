import { Component } from '@angular/core';
import { DoctorData } from 'src/app/data-table/data-table.component';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/shared/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

interface ApiResponse{
  doctors:DoctorData[];
}

@Component({
  selector: 'app-pending-doc',
  templateUrl: './pending-doc.component.html',
  styleUrls: ['./pending-doc.component.css']
})
export class PendingDocComponent {
  private pendingDocSub: Subscription | undefined;
  private approvedDocSub: Subscription | undefined;
  private rejectedDocSub: Subscription | undefined;
  isPendingDoc!:boolean;
  doctorColumns:string[] = ['fullName','mobile_num','email','RegnNumber','specialization','status','Action'];

  dataSource!:MatTableDataSource<DoctorData>
  constructor(
    private adminService:AdminService,
    private _snackBar:MatSnackBar,
    private _dialog:MatDialog
  ){}

  ngOnInit(){
    this.getPendingDoctors();
  }
  getPendingDoctors(){
   this.pendingDocSub =  this.adminService.getPendingDocList().subscribe({
      next:(res)=>{
        if(res && ((res as ApiResponse).doctors)){
          const docArray = ((res as ApiResponse).doctors);
          this.dataSource=new MatTableDataSource<DoctorData>(docArray)
        }else{
          console.log('Unexpected API response:', res);
          
        }
      },
      error:(err)=>{
        console.log('API request error:', err);

      }
    })
  }

  handleApprove(doctorId:string){
    Swal.fire({
      title:'Confirmation',
      text: 'Approve the Doctor?',
      icon:'question',
      showCancelButton: true,
      confirmButtonText:'Confirm',
      cancelButtonText:'Don\'t Approve'
    }).then((result)=>{
      if(result.isConfirmed){
        this.approvedDocSub = this.adminService.postDocApproval(doctorId).subscribe({
          next:(res)=>{
            this._snackBar.open('Doctor Approved','Close',{duration:3000});
            this.dataSource.data = this.dataSource.data.map((row)=>{
              if(row._id === doctorId){
                return {...row,status:'Approved'};
              }
              return row;
            })
          },
          error:(err)=>{
            console.log('error in blocking:',err);
  
          }
        });
      }
    });
   
  }

  handleRejection(doctorId:string){
    Swal.fire({
      title:'Confirmation',
      text:'Rejecting the doctor?',
      icon:'question',
      showCancelButton:true,
      confirmButtonText:'Confirm',
      cancelButtonText:'Don\'t reject'
    }).then((result)=>{
      if(result.isConfirmed){
       const dialogRef = this._dialog.open(MessageDialogComponent);
        dialogRef.afterClosed().subscribe({
          next:(res)=>{
            this.rejectedDocSub = this.adminService.postDocRejection(doctorId,res).subscribe({
              next:(res)=>{
                this._snackBar.open('Doctor rejected','Close',{duration:3000});
                this.dataSource.data = this.dataSource.data.map((row)=>{
                  if(row._id === doctorId){
                    return {...row,status:'Rejected'};
                  }
                  return row;
                })
              },
              error:(err)=>{

              }
            })
             }
        });
      
        
      }
    })
  }

  ngOnDestroy(){
    if(this.pendingDocSub){
      this.pendingDocSub.unsubscribe();
    }
    if(this.approvedDocSub){
      this.approvedDocSub.unsubscribe();
    }
    if(this.rejectedDocSub){
      this.rejectedDocSub.unsubscribe();
    }
  }


}
