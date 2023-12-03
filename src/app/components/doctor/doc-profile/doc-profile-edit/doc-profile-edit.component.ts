import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DoctorService } from 'src/app/shared/doctor.service';
import { doctorProfile } from 'src/app/shared/doctorProfile.model';

@Component({
  selector: 'app-doc-profile-edit',
  templateUrl: './doc-profile-edit.component.html',
  styleUrls: ['./doc-profile-edit.component.css']
})
export class DocProfileEditComponent {
  selectedFileName!: string;
  docEditForm!: FormGroup;
  doctorData!: doctorProfile;
  phoneRegex = /^[0-9]{10}$/; 
  pinRegex = /^(?!000000)[0-9]{6}$/;
  addressRegex= /^[A-Za-z\s.'-]+$/;
  yearRegex = /^(?!0000)\d{4}$/;

  education: string[] = [
    'MBBS',
    'MD',
    'DCH',
    'DNB',
    'FRCS'
  ]
  specialization: string[] = [
    'Internal medicine', 'Pediatrics', 'Orthopedics', 'Urology', 'Psychiatry',
    'Emergency medicine', 'Neurology', 'Pathology', 'Anesthesiology', 'Obstetrics and gynaecology',
    'Ophthalmology', 'Dermatology', 'Family medicine', 'Gastroenterology', 'Oncology', 'Neurosurgery',
    'Otorhinolaryngology', 'Nephrology', 'Rheumatology', 'Geriatric medicine', 'Cardiology', 'Sports medicine',
    'General surgery'
  ]

  constructor(private docService: DoctorService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<DocProfileEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { doctorData: doctorProfile }
  ) {
    this.doctorData = data.doctorData;
    if (this.doctorData?.education) {
      this.docEditForm = fb.group({
        fullName: [{value:this.doctorData.fullName || '',disabled:true}],
        email: [{value:this.doctorData.email || '',disabled:true}],
        mobile_num: [this.doctorData.mobile_num || '',Validators.pattern(this.phoneRegex)],
        profilePic: [''],
        description: [this.doctorData.description || ''],
        RegnNumber: [this.doctorData.RegnNumber || '',Validators.required],
        specialization: [this.doctorData.specialization || ''],
        fee: [this.doctorData.fee || '',Validators.required],
        education: this.fb.group({
          degree: [this.doctorData?.education[0]?.degree || ''],
          college: [this.doctorData?.education[0]?.college || ''],
          year: [this.doctorData?.education[0]?.graduation_year || '',Validators.pattern(this.yearRegex)],
        }),
        experience: this.fb.group({
          hospital: [this.doctorData?.experience?.[0]?.hospital ?? ''],
          term: [this.doctorData?.experience?.[0]?.term ?? '']
        })
      })
    }
  }

  ngOnInit() {

  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    this.selectedFileName = selectedFile.name;
    this.docEditForm.get('profilePic')?.setValue(selectedFile);
  }

  onSubmit() {
    if(this.docEditForm.valid){
      const formData = new FormData();
    formData.append('fullName', this.docEditForm.get('fullName')?.value);
    formData.append('email', this.docEditForm.get('email')?.value);
    formData.append('mobile_num', this.docEditForm.get('mobile_num')?.value);
    // formData.append('description',this.docEditForm.get('description')?.value);
    formData.append('description', this.docEditForm.get('description')?.value); // Add this line for description
    if (this.docEditForm?.get('specialization')?.value) {
      formData.append('specialization', this.docEditForm.get('specialization')?.value);

    }
    formData.append('RegnNumber', this.docEditForm.get('RegnNumber')?.value);
    if (this.docEditForm.get('fee')?.value) {
      formData.append('fee', this.docEditForm.get('fee')?.value);
    }
    if (this.docEditForm?.get('profilePic')?.value) {
      formData.append('profilePic', this.docEditForm.get('profilePic')?.value);
    }
    const education = this.docEditForm.get('education');
    if (education?.value) {
      formData.append('education[degree]', education?.get('degree')?.value);
      formData.append('education[college]', education?.get('college')?.value);
      formData.append('education[graduation_year]', education?.get('year')?.value);
    }
    
    const experience = this.docEditForm?.get('experience');

    if (experience) {
      const hospital = experience.get('hospital');
      const term = experience.get('term');

      formData.append('experience[hospital]', hospital?.value ?? '');
      formData.append('experience[term]', term?.value ?? '');
    } else {
      formData.append('experience[hospital]', '');
      formData.append('experience[term]', '');
    }

    //calling api

    const docId = this.docService.getDoctorId();
    this.docService.updateDoctorProfile(docId, formData).subscribe({
      next: (res) => {


        this._snackBar.open('Profile updated successfully', 'Close', {
          duration: 2000,
        });
        this._dialogRef.close(true);
      },
      error: (err) => {
        // Handle error, e.g., show an error message
        this._snackBar.open('Error updating profile', 'Close', {
          duration: 2000,
        });
      }
    })
  }else{
    this._snackBar.open('Form is Invalid! Please check the fields!!','Close',{duration:3000})
    }
  }

}
