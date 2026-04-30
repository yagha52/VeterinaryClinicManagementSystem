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
  isLoading = false; // Add loading state
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
    
    this.isLoading = true; // Start loading

    this.api.loginVet(loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log("Success!", response);
        // Save the Vet ID and Name so the computer remembers we are logged in
        localStorage.setItem('vet_id', response.vet_id);
        localStorage.setItem('vet_name', response.vet_name);

        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.isLoading = false; // Stop loading
        console.error(err);
        this.errorMessage = "Invalid Email or Password. Try again.";
      }
    });
  }
}
