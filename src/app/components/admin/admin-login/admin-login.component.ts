import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AdminService } from 'src/app/shared/admin.service';
import { Subscription } from 'rxjs';

interface loginRes{
  adminToken:string;
}

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  private loginSubsription: Subscription | undefined;
  loginForm!: FormGroup;
    loading = false;
    submitted = false;
    returnUrl!: string;
    error = '';
    constructor(private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private adminService: AdminService
      ){
        // redirect to home if already logged in
        if (this.adminService.isLoggedIn()) { 
          this.router.navigate(['/admin-dashboard']);
      }
      }
      ngOnInit(){
        this.loginForm = this.formBuilder.group({
          email: ['',[Validators.required,Validators.email]],
          password:['',Validators.required]
        })
      }
      
      onSubmit(){
        const formData = this.loginForm.value;
       this.loginSubsription =  this.adminService.postLogin(formData).subscribe({
          next:res=>{
            this.adminService.setToken((res as loginRes).adminToken);
            this.router.navigateByUrl('/admin-dashboard');
          },
          error:err=>{
            this.error = err.error.message;

          }
        }
         
        )
      }

      ngOnDestroy(){
        if(this.loginSubsription){
          this.loginSubsription.unsubscribe();
        }
      }
}
