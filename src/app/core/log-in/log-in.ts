import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private router = inject(Router);
  private http = inject(HttpClient);

  logInData = {
    email: '',
    password: '',
  };

  onSubmit() {
    this.http.post('https://api.everrest.educata.dev/auth/sign_in', this.logInData).subscribe({
      next: (data: any) => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        this.router.navigateByUrl('/');
        console.log(this.logInData, data);
      },
      error: () => alert('Incorrect email or password'),
    });
  }
}
