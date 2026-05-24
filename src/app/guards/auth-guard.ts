import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = localStorage.getItem('access_token');

  if (isLoggedIn) {
    return true;
  } else {
    const router = inject(Router);
    router.navigateByUrl('/log-in'); 
    return false;
  }
};
