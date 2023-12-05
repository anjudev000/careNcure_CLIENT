import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DoctorService } from 'src/app/shared/doctor.service';
import { SocketService } from 'src/app/shared/socket.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PrescriptionComponent } from '../prescription/prescription.component';
import { Subscription } from 'rxjs';

interface ApiResponse {
  appointments: any;
  totalItems:number;
}
interface confirmResponse {
  message: string
}

interface Appointment {
  _id: string;
  appointmentId: number;
  userId: {
    _id: string;
    fullName: string;
  };
  doctorId: {
    email: string;
  };
  slotBooked: string;
  status: string;
}
interface StatusRes{
  status:string;
}

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent {
  private appointmentsSub:Subscription | undefined;
  private cancelAppointmentsSub:Subscription | undefined;
  private confirmAppointmentsSub:Subscription | undefined;
  appointments: Appointment[] = [];
  isCancelled:boolean=false;
  spinner: boolean = true
  page = 1; // Current page
  pageSize = 8; // Number of items per page
  totalItems = 0; // Total number of items
  filter = ''; // Filter string
    constructor(
    private doctorService: DoctorService,
    private socketService: SocketService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getAppointmentData();
  }



  getAppointmentData() {
    const doctorId = this.doctorService.getDoctorId();
   this.appointmentsSub = this.doctorService.getAppointments(doctorId, this.page, this.pageSize, this.filter).subscribe({
      next: (res) => {
        console.log(466, res);
        this.spinner = false
        const data = ((res as ApiResponse).appointments);
        const  total = ((res as ApiResponse).totalItems);
        console.log(42222, data);
        this.appointments = data;
        this.totalItems = total;
      },
      error: (err: any) => {
        alert('Error fetching the data!');
      }
    })
  }
// Add these methods to your DoctorAppointmentsComponent class
onPageChange(event: any) {
  this.page = event.pageIndex + 1;
  this.getAppointmentData();
}

applyFilter() {
  this.page = 1;
  this.getAppointmentData();
}



  cancelAppointment(id: string) {
    console.log(62, id);
    Swal.fire({
      title: 'Confirmation',
      text: 'Please confirm to cancel the appointment',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancelAppointmentsSub = this.doctorService.cancelAppointments(id).subscribe({
          next: (res: any) => {
            this.getAppointmentData();
            this._snackBar.open('Appointmnet has been cancelled', 'Close', { duration: 4000 });
          }, error: (err: any) => {
            this._snackBar.open('Error occuring while cancelling', 'Close', { duration: 4000 });
          }
        })
      }
    })
  }

  // checkTimeToEnableVideoCall(app:Appointment){
  //   const appointmentTime = new Date(app.slotBooked).getTime();
  //   const currentTime = new Date().getTime();
  //   const timeDifference = currentTime - appointmentTime;
  //   const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
  //   app.enableStartCallButton = timeDifference <= fifteenMinutesInMilliseconds;
  // }

  handleButtonClick(app: Appointment) {
    if (app.status === 'Confirmed') {
      this.startVideoCall(app);
    } else if (app.status === 'Completed') {
      this.createPrescription(app);
    } else {
      this.confirmAppointment(app._id);
    }
  }

  confirmAppointment(id: string) {
    this.confirmAppointmentsSub = this.doctorService.confirmAppointment(id).subscribe({
      next: (res) => {
        const response = ((res as confirmResponse).message)
        this._snackBar.open(response, 'Close', { duration: 4000 });
        this.getAppointmentData();
      },
      error: (err) => {

      }
    })
  }
  startVideoCall(app: Appointment) {

    this.doctorService.getAppStatus(app.appointmentId).subscribe({
      next:(res)=>{
        const statusData = ((res as StatusRes).status);
        
        if (statusData === 'Cancelled') {
          // If the appointment is cancelled, do not proceed with the video call.
          console.log('Appointment is cancelled. Cannot start the call.');
          this._snackBar.open('Appointment is cancelled. Cannot start the call.','Close',{duration:3000});
          return;
        }else{
          console.log('working here',statusData);
          const room = app._id + app.userId._id;
          const email = app.doctorId.email;
          console.log(119, room);
          this.socketService.joinRoom({ email, room });
          console.log(128, room)
          this.router.navigate([`doctor/call/${room}`], { state: { value: 'doctor', appointmentId: app._id } });
      
        }
        }
    })
  }

  createPrescription(app: Appointment) {
    this._dialog.open(PrescriptionComponent, {
      data: { id: app._id,appointmentID: app.appointmentId, userId: app.userId._id }
    });
  }

  ngOnDestroy(){
    if(this.appointmentsSub){
      this.appointmentsSub.unsubscribe();
    }
    if(this.confirmAppointmentsSub){
      this.confirmAppointmentsSub.unsubscribe();
    }
    if(this.cancelAppointmentsSub){
      this.cancelAppointmentsSub.unsubscribe();
    }
  }


}
