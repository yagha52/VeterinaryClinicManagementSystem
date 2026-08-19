import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pet-dash',
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './pet-dash.html',
  styleUrl: './pet-dash.css',
  standalone: true,
})
export class PetDash implements OnInit {

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  owners: any[] = [];
  pets: any[] = [];
  showForm = false;
  isEditMode = false;
  selectedPetId: number | null = null;
  selectedPet: any = null;
  isLoading = false;
  isSavingEntry = false;
  selectedFileName: string | null = null;
  successMessage = '';
  errorMessage = '';

  newPet = new FormGroup({
    pet_name: new FormControl<string>('', [Validators.required]),
    owner: new FormControl<number | null>(null, [Validators.required]),
    species: new FormControl<string>('', [Validators.required]),
    breed: new FormControl<string>('', [Validators.required]),
    gender: new FormControl<string>('', [Validators.required]),
    color: new FormControl<string>('', [Validators.required]),
    weight: new FormControl<number | null>(null, [Validators.required]),
    birth_date: new FormControl<string | null>(null, [Validators.required]),
    allergies: new FormControl<string>('', []),
    vaccinations_notes: new FormControl<string>('', [])
  });

  newEntry = new FormGroup({
    file: new FormControl<File | null>(null, []),
    notes: new FormControl<string>('', [])
  });

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newEntry.get('file')?.setValue(file);
      this.selectedFileName = file.name;
    } else {
      this.selectedFileName = null;
    }
  }

  saveMedicalEntry() {
    if (!this.selectedPetId || (this.newEntry.get('file')?.value === null && this.newEntry.get('notes')?.value === '')) {
      return;
    }
    
    this.isSavingEntry = true;
    const formData = new FormData();
    const file = this.newEntry.get('file')?.value;
    const notes = this.newEntry.get('notes')?.value;
    
    if (file) formData.append('file', file);
    if (notes) formData.append('notes', notes);

    this.api.addMedicalEntry(this.selectedPetId, formData).subscribe({
      next: (entry) => {
        this.isSavingEntry = false;
        this.showSuccess('Medical entry added successfully!');
        if (this.selectedPet) {
          if (!this.selectedPet.medical_entries) this.selectedPet.medical_entries = [];
          this.selectedPet.medical_entries.unshift(entry); // add to top
        }
        this.newEntry.reset();
        this.selectedFileName = null;
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        this.retrievePets(); // refresh table data
      },
      error: (err) => {
        this.showError('Failed to save entry. Please try again.');
        this.isSavingEntry = false;
      }
    });
  }

  addPet() {
    this.isEditMode = false;
    this.selectedPetId = null;
    this.selectedFileName = null;
    this.newPet.reset({
      gender: 'Male',
      owner: null,
      status: 'Scheduled'
    } as any);
    this.showForm = true;
  }

  editPet(pet: any) {
    this.isEditMode = true;
    this.selectedPetId = pet.id;
    this.selectedPet = pet;
    this.selectedFileName = null;
    this.newEntry.reset();
    this.newPet.patchValue({
      pet_name: pet.pet_name,
      owner: pet.owner,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      color: pet.color,
      weight: pet.weight,
      birth_date: pet.birth_date,
      allergies: pet.allergies,
      vaccinations_notes: pet.vaccinations_notes
    });
    this.showForm = true;
  }

  savePet() {
    if (this.newPet.invalid) return;

    const formData = new FormData();
    Object.keys(this.newPet.controls).forEach(key => {
      const value = this.newPet.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    this.isLoading = true;
    if (this.isEditMode && this.selectedPetId) {
      this.api.updatePet(this.selectedPetId, formData).subscribe({
        next: () => {
          this.showSuccess('Pet updated successfully!');
          this.finishSave();
          this.showForm = false;
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.api.createPet(formData).subscribe({
        next: (createdPet) => {
          // Handle optional initial medical record
          const file = this.newEntry.get('file')?.value;
          const notes = this.newEntry.get('notes')?.value;
          
          if (file || notes) {
            const entryData = new FormData();
            if (file) entryData.append('file', file);
            if (notes) entryData.append('notes', notes);
            
            this.api.addMedicalEntry(createdPet.id, entryData).subscribe({
              next: () => {
                this.showSuccess('Pet and initial medical record added successfully!');
                this.newEntry.reset();
                this.selectedFileName = null;
                this.finishSave();
              },
              error: (err) => {
                this.showError('Pet added, but failed to attach initial medical record.');
                this.newEntry.reset();
                this.selectedFileName = null;
                this.finishSave();
              }
            });
          } else {
            this.showSuccess('Pet added successfully!');
            this.finishSave();
          }
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  deletePet(id: number) {
    if (confirm("Are you sure you want to remove this pet?")) {
      this.api.deletePet(id).subscribe({
        next: () => {
          this.pets = this.pets.filter(p => p.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }

  finishSave() {
    this.showForm = false;
    this.retrievePets();
  }

  handleError(err: any) {
    this.showError('Failed to save pet. Please check all fields.');
    this.isLoading = false;
  }

  getHistoryUrl(historyPath: string): string {
    if (!historyPath) return '';
    // If it's already a full URL, leave it alone
    if (historyPath.startsWith('http')) return historyPath;

    // If it already has /media/ at the start, don't add it again!
    if (historyPath.startsWith('/media/')) {
      return `${environment.mediaUrl}${historyPath}`;
    }

    // Otherwise, add the base media path
    return `${environment.mediaUrl}/media/${historyPath}`;
  }

  retrieveOwner() {
    this.isLoading = true;
    this.api.getOwners().subscribe({
      next: (data) => {
        this.owners = Array.isArray(data) ? data : (data.results || []);
        this.cdr.detectChanges();
        // Fetch pets only after owners are loaded
        this.retrievePets();
      },
      error: (err) => {
        // still try to fetch pets even if owner fetch failed
        this.showError('Failed to load owners.');
        this.retrievePets();
      }
    });
  }

  retrievePets() {
    this.isLoading = true;
    this.api.getPets().subscribe({
      next: (data) => {
        // Safety check to handle both array and paginated results
        this.pets = Array.isArray(data) ? data : (data.results || []);
        this.isLoading = false;
        this.cdr.detectChanges(); // Force the table to update
      },
      error: (err) => {
        console.error("Error fetching pets", err);
        this.isLoading = false;
      }
    });
  }

  getOwnerName(ownerId: number): string {
    const owner = this.owners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Unknown';
  }

  getOwnerPhone(ownerId: number): string {
    const owner = this.owners.find(o => o.id === ownerId);
    return owner ? owner.phone : 'Unknown';
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
  }

  ngOnInit(): void {
    this.retrieveOwner();
  }




}
