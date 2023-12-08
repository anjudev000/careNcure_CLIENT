import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { loginModel } from 'src/app/shared/login.model';
import { UserService } from 'src/app/shared/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


interface LoginResponse {
  userToken: string
}

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm!: FormGroup;
  errorMessages!: string;
  isDoctor: boolean = false;
  subData: Subscription | undefined;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
      this.router.navigateByUrl('/user-home');
    }
  }


  handleLoginSubmit(formData: loginModel) {
    this.errorMessages = '';

    this.subData = this.userService.postLogin(formData).subscribe({
      next:(res) => {

        this.userService.setToken((res as LoginResponse).userToken);

        this.router.navigateByUrl('/user-home');
      },
      error:(err) => {
        this.errorMessages = err.error.message;
        if (err.error.notVerified) {
          this.errorMessages = 'User Not Verified! Please Verify to continue. Otp is send to your mail';
          setTimeout(() => {
            this.router.navigate(['/user-otp-verify'], { state: { email: formData.email } });
          }, 6000)
        }
      }
  })
  }

  ngOnDestroy(){
    if(this.subData){
      this.subData.unsubscribe();
    }
  }
  

}
