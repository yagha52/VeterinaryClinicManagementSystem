import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api'; 
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent], // Need FormsModule for the Search Bar and Form!
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.css']
})
export class Appointments implements OnInit {
  // Variables to hold info
  vetName = 'Doctor';
  appointmentList: any[] = [];
  filteredList: any[] = [];
  petList: any[] = [];
  ownerList: any[] = [];
  searchQuery = '';
  statusFilter = ''; // Empty means show ALL statuses
  dateFilter = ''; // Empty means show ALL time

  showForm = false;
  isEditMode = false;
  isLoading = true; // Add loading state
  currentEditId: number | null = null;
  errorMessage = '';
  successMessage = '';

  newAppointment = {
    appointment_date: '',
    appointment_time: '',
    diagnosis_notes: '',
    reason: '',
    treatment_plan: '',
    status: 'Scheduled',
    pet: null, 
    veterinarian: Number(localStorage.getItem('vet_id'))
  };

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  // "ngOnInit" is an Angular command meaning: "Run this code the exact millisecond this screen loads"
  ngOnInit() {
    const fullName = localStorage.getItem('vet_name') || 'Doctor';
    const firstWord = fullName.split(' ')[0];
    this.vetName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    
    this.api.getOwners().subscribe({
      next: (ownerData) => {
        this.ownerList = Array.isArray(ownerData) ? ownerData : (ownerData.results || []);
        
        this.api.getPets().subscribe({
          next: (petData) => {
            this.petList = petData;
            this.fetchAppointments();
          },
          error: (err) => {
            console.error("Failed to load pets:", err);
            this.fetchAppointments();
          }
        });
      },
      error: (err) => {
        console.error("Failed to load owners:", err);
        this.fetchAppointments();
      }
    });
  }

  getPetName(petId: number): string {
    const pet = this.petList.find(p => p.id === petId);
    return pet ? pet.pet_name : 'Unknown Pet';
  }

  getPetSpecies(petId: number): string {
    const pet = this.petList.find(p => p.id === petId);
    return pet ? pet.species : 'Unknown';
  }

  getOwnerName(petId: number): string {
    const pet = this.petList.find(p => p.id === petId);
    if (pet && pet.owner) {
      const owner = this.ownerList.find(o => o.id === pet.owner);
      return owner ? owner.name : 'Unknown Owner';
    }
    return 'Unknown Owner';
  }

  // Use our Postman service to grab the appointments from Django
  fetchAppointments() {
    // Only show the big loading spinner if we have NO data yet (initial load)
    if (this.appointmentList.length === 0) {
      this.isLoading = true; 
    }
    // Fetch ALL appointments without search query
    this.api.getAppointments().subscribe({
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

  applyFilter() {
    let temp = [...this.appointmentList];

    // 1. Status Filter
    if (this.statusFilter === 'Scheduled' || this.statusFilter === 'Completed' || this.statusFilter === 'Cancelled') {
      temp = temp.filter(a => a.status === this.statusFilter);
    }

    // 2. Date Filter
    if (this.dateFilter) {
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-CA');
      
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
      
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekStr = nextWeek.toLocaleDateString('en-CA');

      temp = temp.filter(a => {
        if (this.dateFilter === 'Today') {
          return a.appointment_date === todayStr;
        } else if (this.dateFilter === 'Tomorrow') {
          return a.appointment_date === tomorrowStr;
        } else if (this.dateFilter === 'Next 7 Days') {
          return a.appointment_date >= todayStr && a.appointment_date <= nextWeekStr;
        }
        return true;
      });
    }

    // 3. Search Bar (Live Filter)
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      
      const matchWordStart = (text: string, search: string) => {
        if (!text) return false;
        // Split by spaces and check if any word starts with the search query
        return text.split(/\s+/).some(word => word.startsWith(search));
      };

      temp = temp.filter(a => {
        const petName = this.getPetName(a.pet).toLowerCase();
        const species = this.getPetSpecies(a.pet).toLowerCase();
        const ownerName = this.getOwnerName(a.pet).toLowerCase();
        const notes = (a.reason || '').toLowerCase();
        
        return matchWordStart(petName, q) || 
               matchWordStart(species, q) || 
               matchWordStart(ownerName, q) || 
               matchWordStart(notes, q);
      });
    }

    // 4. Chronological Sorting (Earliest First)
    temp.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00'}`).getTime();
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00'}`).getTime();
      return dateA - dateB;
    });

    this.filteredList = temp;
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
    this.newAppointment = { appointment_date: '', appointment_time: '', diagnosis_notes: '', reason: '', treatment_plan: '', status: 'Scheduled', pet: null, veterinarian: Number(localStorage.getItem('vet_id')) };
  }

  editAppointment(appt: any) {
    this.isEditMode = true;
    this.currentEditId = appt.id;
    this.newAppointment = { ...appt }; 
    this.showForm = true;
  }

  saveAppointment() {
    // Validate required fields before submitting
    if (!this.newAppointment.pet || !this.newAppointment.appointment_date || !this.newAppointment.appointment_time) {
      this.errorMessage = 'Please fill in all required fields: Pet, Date, and Time.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }

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
        error: (err) => {
          this.errorMessage = 'Failed to update appointment. Reverting changes.';
          setTimeout(() => this.errorMessage = '', 4000);
          this.fetchAppointments(); // revert optimistic update
        }
      });
    } else {
      // For create, we just send to Django and refresh when done
      this.api.createAppointment(data).subscribe({
        next: () => {
          this.fetchAppointments();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create appointment. Please try again.';
          setTimeout(() => this.errorMessage = '', 4000);
        }
      });
    }
  }
}
