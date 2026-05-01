import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  vetName = 'Doctor';

  constructor(private router: Router) {}

  ngOnInit() {
    const fullName = localStorage.getItem('vet_name') || 'Doctor';
    const firstWord = fullName.split(' ')[0];
    this.vetName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }

  logout() {
    localStorage.removeItem('vet_id');
    localStorage.removeItem('vet_name');
    this.router.navigate(['/login']);
  }
}
