import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './notification';

interface ISignUpData {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address: string;
  phone: string;
  zipcode: string;
  avatar: string;
  gender: string;
}

@Component({
  selector: 'app-registration',
  imports: [FormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  signUpData: ISignUpData = {
    firstName: '',
    lastName: '',
    age: 0,
    email: '',
    password: '',
    address: '',
    phone: '',
    zipcode: '',
    avatar: '',
    gender: 'MALE',
  };

  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  onSubmit() {
    this.http
      .post<any>('https://api.everrest.educata.dev/auth/sign_up', this.signUpData)
      .subscribe({
        next: (data) => {
          sessionStorage.setItem('registered_email', data.email);
          this.notification.success('რეგისტრაცია წარმატებით დასრულდა');
          this.router.navigateByUrl('/log-in');
          
        },
        error: () => {
          this.notification.error('რეგისტრაცია ვერ შესრულდა');
        },
      });
  }
}
