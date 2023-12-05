import { Component } from '@angular/core';
import { AdminService } from 'src/app/shared/admin.service';
import { UserData } from 'src/app/data-table/data-table.component';
import {MatTableDataSource} from '@angular/material/table';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';


interface ApiResponse {
  users: UserData[]; // Assuming 'users' is the property containing an array of UserData
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  private userListSub:Subscription | undefined;
  private userBlockSub:Subscription | undefined;

  isUser!:boolean;
  userColumns: string[] = ['fullName', 'mobile_num', 'email','Action'];
 
  header: string[] = ['Name', 'Phone', 'Email', 'Action'];
  dataSource!:MatTableDataSource<UserData>
  block:boolean=true;
  constructor(private adminService:AdminService,
    private _snackBar:MatSnackBar
    ){
      this.getAllUser();

    }



getAllUser() {
  this.userListSub = this.adminService.getAllUsers().subscribe({
    next: (res) => {
        if (res && ((res as ApiResponse).users)) {
          // Assuming your API response structure is { "users": [...] }
          console.log(res,400000);
          const usersArray = ((res as ApiResponse).users);
          this.dataSource = new MatTableDataSource<UserData>(usersArray);
        } else {
          // Handle any other unexpected response structure or error
          console.error('Unexpected API response:', res);
        }
      },error: (err) => {
      console.error('API request error:', err);
    }
  });
}



handleblock(userId: string, isblocked: boolean) {
  const confirmationMessage = isblocked ? 'Do you want to unblock this user?' : 'Do you want to block this user?';

  // Show a Swal confirmation alert
  Swal.fire({
    title: 'Confirmation',
    text: confirmationMessage,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  }).then((result) => {
    if (result.isConfirmed) {
      // User confirmed, proceed with the block/unblock action
      const apimethod = isblocked ? this.adminService.postUserBlockUnblock(userId) : this.adminService.postUserBlockUnblock(userId);
     this.userBlockSub =  apimethod.subscribe({
        next: (res) => {
          // Update the button text after successful API call
          const updatedRow = this.dataSource.data.find((row) => row._id === userId);
          if (updatedRow) {
            updatedRow.isblock = !isblocked;
          }
          console.log(isblocked ? 'User unblocked' : 'User blocked');
           // Show a snack bar message
           this._snackBar.open(isblocked ? 'User Unblocked' : 'User Blocked', 'Close', { duration: 3000 });
        
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });
    }
  });
}

ngOnDestroy(){
  if(this.userListSub){
this.userListSub.unsubscribe();
  }
  if(this.userBlockSub){
    this.userBlockSub.unsubscribe();
  }
}



}
