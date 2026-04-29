import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  constructor(private api: ApiService, private router: Router) { }
  ngOnInit(): void {
    if (localStorage.getItem('vet_id')) {
      this.router.navigate(['/appointments']);
    }
  }
  submitLogin() {
    const loginData = {
      email: this.email,
      password: this.password
    };
    this.api.loginVet(loginData).subscribe({
      next: (response: any) => {
        console.log("Success!", response);
        // Save the Vet ID so the computer remembers we are logged in
        localStorage.setItem('vet_id', response.vet_id);

        // TODO: Redirect to the Appointments Dashboard later
        alert(`Welcome, ${response.vet_name}!`);

        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Invalid Email or Password. Try again.";
      }
    });
  }
}
