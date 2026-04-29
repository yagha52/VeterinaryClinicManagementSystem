import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api'; 
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Need FormsModule for the Search Bar and Form!
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.css']
})
export class Appointments implements OnInit {
  // Variables to hold info
  vetName = 'Doctor';
  appointmentList: any[] = [];
  searchQuery = '';
  statusFilter = ''; // Empty means show ALL statuses

  // Getter: automatically filters appointmentList when statusFilter changes
  get filteredAppointments() {
    if (!this.statusFilter) return this.appointmentList;
    return this.appointmentList.filter(a => a.status === this.statusFilter);
  }

  showForm = false;

  newAppointment = {
    appointment_date: '',
    appointment_time: '',
    diagnosis_notes: '',
    reason: '',
    treatment_plan: '',
    status: 'Scheduled',
    pet: 1, 
    veterinarian: Number(localStorage.getItem('vet_id'))
  };

  constructor(private api: ApiService, private router: Router) {}

  // "ngOnInit" is an Angular command meaning: "Run this code the exact millisecond this screen loads"
  ngOnInit() {
    this.vetName = localStorage.getItem('vet_name') || 'Doctor';
    this.fetchAppointments();
  }

  // Use our Postman service to grab the appointments from Django
  fetchAppointments() {
    this.api.getAppointments(this.searchQuery).subscribe({
      next: (data) => {
        this.appointmentList = data;
      },
      error: (err) => console.error("Failed to load appointments:", err)
    });
  }

  // When the Search Button is clicked
  onSearch() {
    this.fetchAppointments();
  }

  // When the Status Dropdown changes
  onStatusChange() {
    // No API call needed! The filteredAppointments getter handles it automatically.
  }

  toggleForm(){
    this.showForm = !this.showForm;
  }

  createAppointment(){
    this.api.createAppointment(this.newAppointment).subscribe({
      next: () => {
        this.showForm = false;
        this.newAppointment = { appointment_date: '', appointment_time: '', diagnosis_notes: '', reason: '', treatment_plan: '', status: 'Scheduled', pet: 1, veterinarian: Number(localStorage.getItem('vet_id')) };        this.fetchAppointments();
      },
      error: (err) => console.error("Failed to create appointment:", err)
    });
  }

  // The Logout Button
  logout() {
    localStorage.removeItem('vet_id');
    localStorage.removeItem('vet_name');
    this.router.navigate(['/login']);
  }
}
