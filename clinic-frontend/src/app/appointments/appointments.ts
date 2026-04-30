import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api'; 
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

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
  filteredList: any[] = [];
  searchQuery = '';
  statusFilter = ''; // Empty means show ALL statuses

  showForm = false;
  isEditMode = false;
  isLoading = true; // Add loading state
  currentEditId: number | null = null;

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

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  // "ngOnInit" is an Angular command meaning: "Run this code the exact millisecond this screen loads"
  ngOnInit() {
    const fullName = localStorage.getItem('vet_name') || 'Doctor';
    const firstWord = fullName.split(' ')[0];
    this.vetName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    
    this.fetchAppointments();
  }

  // Use our Postman service to grab the appointments from Django
  fetchAppointments() {
    // Only show the big loading spinner if we have NO data yet (initial load)
    if (this.appointmentList.length === 0) {
      this.isLoading = true; 
    }
    this.api.getAppointments(this.searchQuery).subscribe({
      next: (data) => {
        this.appointmentList = data;
        this.applyFilter();
        this.isLoading = false; // Turn off spinner
        this.cdr.detectChanges(); // NUCLEAR OPTION: Force Angular to redraw the screen right now
      },
      error: (err) => {
        console.error("Failed to load appointments:", err);
        this.isLoading = false;
      }
    });
  }

  // Explicitly apply the filter to ensure Angular detects the change immediately
  applyFilter() {
    // Angular sometimes initializes select elements with phantom values if not perfectly matched.
    // We only filter if the status is exactly one of the valid Django statuses.
    if (this.statusFilter === 'Scheduled' || this.statusFilter === 'Completed' || this.statusFilter === 'Cancelled') {
      this.filteredList = this.appointmentList.filter(a => a.status === this.statusFilter);
    } else {
      // If it's empty, or any other phantom value, show everything.
      // We use the spread operator [...] to force Angular to detect the array change.
      this.filteredList = [...this.appointmentList];
    }
  }

  // When the Search Button is clicked
  onSearch() {
    this.fetchAppointments();
  }

  // When the Status Dropdown changes
  onStatusChange() {
    this.applyFilter();
  }

  toggleForm(){
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.newAppointment = { appointment_date: '', appointment_time: '', diagnosis_notes: '', reason: '', treatment_plan: '', status: 'Scheduled', pet: 1, veterinarian: Number(localStorage.getItem('vet_id')) };
  }

  editAppointment(appt: any) {
    this.isEditMode = true;
    this.currentEditId = appt.id;
    this.newAppointment = { ...appt }; 
    this.showForm = true;
  }

  saveAppointment() {
    const mode = this.isEditMode;
    const id = this.currentEditId;
    const data = { ...this.newAppointment }; // copy the data

    // OPTIMISTIC UI: We close the modal instantly! 
    this.showForm = false;
    this.resetForm();

    if (mode && id) {
      // 1. Update the table locally instantly so there is ZERO delay
      const index = this.appointmentList.findIndex(a => a.id === id);
      if (index !== -1) {
        this.appointmentList[index] = { ...data, id: id };
        this.applyFilter();
      }

      // 2. Sync to Django in the background
      this.api.updateAppointment(id, data).subscribe({
        next: () => {
          this.fetchAppointments(); // final sync just to be safe
        },
        error: (err) => console.error("Failed to update appointment:", err)
      });
    } else {
      // For create, we just send to Django and refresh when done
      this.api.createAppointment(data).subscribe({
        next: () => {
          this.fetchAppointments();
        },
        error: (err) => console.error("Failed to create appointment:", err)
      });
    }
  }

  // The Logout Button
  logout() {
    localStorage.removeItem('vet_id');
    localStorage.removeItem('vet_name');
    this.router.navigate(['/login']);
  }
}
