import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-pet-dash',
  imports: [ReactiveFormsModule, CommonModule],
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
  isLoading = false;

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
    vaccinations_notes: new FormControl<string>('', []),
    medical_history: new FormControl<File | null>(null, [])
  });

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newPet.get('medical_history')?.setValue(file);
    }
  }

  addPet() {
    this.isEditMode = false;
    this.selectedPetId = null;
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
        // Only append file if it's a new file object
        if (key === 'medical_history') {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, value);
        }
      }
    });

    this.isLoading = true;
    if (this.isEditMode && this.selectedPetId) {
      this.api.updatePet(this.selectedPetId, formData).subscribe({
        next: () => {
          alert("Pet updated successfully!");
          this.finishSave();
          this.showForm = false;
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.api.createPet(formData).subscribe({
        next: () => {
          alert("Pet added successfully!");
          this.finishSave();
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
    console.error("Operation failed", err);
    alert("Failed to save pet. Please check all fields.");
    this.isLoading = false;
  }

  getHistoryUrl(historyPath: string): string {
    if (!historyPath) return '';
    // If it's already a full URL, leave it alone
    if (historyPath.startsWith('http')) return historyPath;

    // If it already has /media/ at the start, don't add it again!
    if (historyPath.startsWith('/media/')) {
      return `http://127.0.0.1:8000${historyPath}`;
    }

    // Otherwise, add the base media path
    return `http://127.0.0.1:8000/media/${historyPath}`;
  }

  retrieveOwner() {
    this.api.getOwners().subscribe({
      next: (data) => {
        // Safety check to handle both array and paginated results
        this.owners = Array.isArray(data) ? data : (data.results || []);
        console.log("OWNERS IN PET DASH:", this.owners); // DEBUG LOG
        this.cdr.detectChanges(); // Force the dropdown to update
      },
      error: (err) => {
        console.error("error fetching owner", err);
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

  ngOnInit(): void {
    this.retrieveOwner();
    this.retrievePets();
  }




}
