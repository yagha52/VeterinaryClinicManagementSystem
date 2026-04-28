import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  // Angular automatically injects the HttpClient and Router tools for us here
  constructor(private http: HttpClient, private router: Router) { }
  submitLogin() {
    const loginData = {
      email: this.email,
      password: this.password
    };
    this.http.post('http://127.0.0.1:8000/api/auth/login/', loginData).subscribe({
      next: (response: any) => {
        console.log("Success!", response);
        // Save the Vet ID so the computer remembers we are logged in
        localStorage.setItem('vet_id', response.vet_id);

        // TODO: Redirect to the Appointments Dashboard later
        alert(`Welcome, ${response.vet_name}!`);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Invalid Email or Password. Try again.";
      }
    });
  }
}
