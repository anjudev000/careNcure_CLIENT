import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DoctorDataService } from 'src/app/shared/doctor-data.service';
import { UserService } from 'src/app/shared/user.service';

interface Department{
  deptName:string
}


interface ApiResponse{
  doctors:Array<Doctor>
}
interface Doctor {
  _id: string;
  fullName: string;
  mobile_num: string;
  profilePic: string;
  education: Education[];
  experience: Experience[];
  description?: string; 
  specialization?: string; 
  fee?: number; 
  slots: Slot[];
}

interface Education {
  degree: string;
  college: string;
  graduation_year: string;
}

interface Experience {
  hospital: string;
  term: number;
}

interface Slot {
  date: string;
  timeslots: string[];
}


@Component({
  selector: 'app-find-doctors',
  templateUrl: './find-doctors.component.html',
  styleUrls: ['./find-doctors.component.css']
})
export class FindDoctorsComponent {
  doctorsList!:any;
  docCount!:number;
  deptName!:Department;
  subData : Subscription | undefined; 
  
  constructor(private route:ActivatedRoute,
    private userservice:UserService,
    private router:Router,
    private doctorData:DoctorDataService,
    private _snackBar:MatSnackBar
    ){}

  ngOnInit(){
    this.route.params.subscribe(params=>{
      this.deptName = params['deptName'];
      this.getAllDoctor(this.deptName);
    })
  }

  getAllDoctor(deptName:Department){
    this.subData = this.userservice.getDeptWiseDoctor(deptName).subscribe({
      next:(res)=>{
        this.doctorsList = ((res as ApiResponse).doctors);
        this.docCount = this.doctorsList.length;
        console.log(74,this.doctorsList);
        console.log(75,this.docCount);
        },
        error:(err)=>{
           // Check if the error status is 404 (Not Found)
      if (err.status === 404) {
        // Set docCount to 0 if no doctors are found
        this.docCount = 0;
      } else {
        console.error('Error fetching doctors:', err);
        this._snackBar.open('err','Close',{duration:3000});
      }
        }
    })
  }

  onClick(doctor:Doctor){
    console.log(8000,doctor.fullName);
    this.doctorData.setDoc(doctor);
    this.router.navigateByUrl('/booking')
  }

  ngOnDestroy(){
    if(this.subData){
      this.subData.unsubscribe();
    }
  }
}
