import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  // 1. We grab the Router tool so we can redirect people
  const router = inject(Router);
  
  // 2. Check if there is a vet_id saved in the browser's memory
  const vetId = localStorage.getItem('vet_id');

  if (vetId) {
    // They are on the VIP list, let them pass!
    return true;
  } else {
    // They are NOT logged in. Kick them back to the login screen!
    router.navigate(['/login']);
    return false;
  }
};
