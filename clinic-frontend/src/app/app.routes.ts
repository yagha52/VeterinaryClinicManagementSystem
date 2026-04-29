import { Routes } from '@angular/router';
import { Login } from './login/login';
import {OwnerDash} from './owner-dash/owner-dash';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'owner-dash', component: OwnerDash },
];
