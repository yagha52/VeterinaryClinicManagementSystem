import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-owner-dash',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './owner-dash.html',
  styleUrl: './owner-dash.css',
})

export class OwnerDash {

  showForm = false

  newOwner = new FormGroup({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    image: new FormControl(null, [Validators.required])
  })

  onFileSelected(event: any) {
    const file = event.target.files?.[0]
    if (file) {
      this.newOwner.get('image')?.setValue(file)//the event, the elt that triggered it, files input only 
    }
    // it returns a list, so we take first elet which will be our file object
  }

  addOwnerClick() {
    console.log('clicked')
    this.showForm = true
  }

  saveOwner() {
    
  }
}
