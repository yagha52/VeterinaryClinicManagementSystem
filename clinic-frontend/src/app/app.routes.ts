import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Appointments } from './appointments/appointments';
import { OwnerDash } from './owner-dash/owner-dash';
import { authGuard } from './auth-guard';
import { PetDash } from './pet-dash/pet-dash';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'appointments', component: Appointments, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'owners', component: OwnerDash },
  { path: 'pets', component: PetDash },
];
