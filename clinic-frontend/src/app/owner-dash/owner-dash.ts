import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-owner-dash',
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './owner-dash.html',
  styleUrl: './owner-dash.css',
  standalone: true,
})

export class OwnerDash implements OnInit {

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }
  //ApiService is a service where angular communicates with django in the functions
  //without always calling for http. that's why we call api 

  //ChangeDetectorRef so Angular refresh the UI faster
  
  showForm = false;
  showDetailed = true;
  isLoading = false;
  isLoadingDetails = false;
  isEditMode = false;
  selectedOwner: any = null;
  owners: any[] = [];
  successMessage = '';
  errorMessage = '';

  newOwner = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    phone: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    image: new FormControl<File | null>(null, [Validators.required])
  });

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newOwner.get('image')?.setValue(file);//the event, the elt that triggered it, files input only 
    }
    // it returns a list, so we take first elet which will be our file object
  }

  addOwnerClick() {
    this.isEditMode = false;
    this.newOwner.reset();
    // Re-add required validator for image when adding new
    this.newOwner.get('image')?.setValidators([Validators.required]);
    this.showForm = true;
  }

  editOwner() {
    if (!this.selectedOwner) return;
    this.isEditMode = true;

    // Fill form with current data
    this.newOwner.patchValue({
      name: this.selectedOwner.name,
      phone: this.selectedOwner.phone,
      email: this.selectedOwner.contact_email,
      image: null // Reset image field (optional for update)
    });

    // Remove required validator for image when editing (keep old photo)
    this.newOwner.get('image')?.clearValidators();
    this.newOwner.get('image')?.updateValueAndValidity();

    this.showForm = true;
    this.showDetailed = false;
  }

  saveOwner() {
    const formdata = new FormData();
    const values: any = this.newOwner.value;

    formdata.append('name', values.name ?? '');
    formdata.append('phone', values.phone ?? '');
    formdata.append('contact_email', values.email ?? '');

    if (values.image) {
      formdata.append('owner_photo', values.image);
    }

    this.isLoading = true; // Show loading state

    if (this.isEditMode && this.selectedOwner) {
      // UPDATE EXISTING
      this.api.updateOwner(this.selectedOwner.id, formdata).subscribe({
        next: (updated) => {
          this.owners = this.owners.map(o => o.id === updated.id ? updated : o);
          this.selectedOwner = null; // Remove details popup
          this.showDetailed = true;
          this.showForm = false; // Remove edit popup
          this.isLoading = false;
          this.showSuccess('Profile updated successfully!');
          this.retrieveOwners(true);
          this.showDetailed = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.showError('Update failed. Please try again.');
        }
      });
    } else {
      // CREATE NEW
      this.api.createOwner(formdata).subscribe({
        next: (data) => {
          this.owners = [...this.owners, data];
          this.showForm = false;
          this.newOwner.reset();
          this.isLoading = false;
          this.showSuccess('Owner added successfully!');
          this.retrieveOwners(true);
        },
        error: (err) => {
          this.isLoading = false;
          this.showError('Failed to add owner. Please check all fields.');
        }
      });
    }
  }

  retrieveOwners(silent: boolean = false) {
    if (!silent) this.isLoading = true;
    this.api.getOwners().subscribe({
      next: (data) => {
        this.owners = Array.isArray(data) ? data : (data.results || []);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Failed to load owners from the server.');
      }
    });
  }

  openDetails(owner: any) {
    this.selectedOwner = owner;
    this.showDetailed = true; // Ensure popup is visible when opening a new one

    // If we don't have the photo (because we loaded the "Short" version), fetch it now
    if (!owner.owner_photo) {
      this.isLoadingDetails = true;
      this.api.getOwnerDetail(owner.id).subscribe({
        next: (fullOwner) => {
          this.selectedOwner = fullOwner;
          this.isLoadingDetails = false;
          // Update the owner in the list too so we don't fetch again
          const index = this.owners.findIndex(o => o.id === owner.id);
          if (index !== -1) this.owners[index] = fullOwner;
        },
        error: (err) => {
          console.error("Failed to fetch photo:", err);
          this.isLoadingDetails = false;
        }
      });
    }
  }

  closeDetails() {
    this.selectedOwner = null;
    this.showDetailed = true; // Reset for next time
  }

  deleteOwner() {
    if (!this.selectedOwner) return;

    if (confirm(`Are you sure you want to delete ${this.selectedOwner.name}?`)) {
      const idToDelete = this.selectedOwner.id;

      // Close popup immediately
      this.closeDetails();

      this.api.deleteOwner(idToDelete).subscribe({
        next: () => {
          // Optimistic update: remove from local list immediately
          this.owners = this.owners.filter(o => o.id !== idToDelete);
          this.cdr.detectChanges();
          this.showSuccess('Owner deleted successfully.');
        },
        error: (err) => {
          this.showError('Delete failed. Please try again.');
          this.retrieveOwners(); // Sync back if it failed
        }
      });
    }
  }

  getPhotoUrl(path: string): string {
    if (!path) return 'assets/default-owner.png';
    // If the path is already a full URL (happens in some DRF configs)
    if (path.startsWith('http')) return path;

    // Ensure there's a leading slash if not present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${environment.mediaUrl}${cleanPath}`;
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
    this.retrieveOwners();
  }

}
