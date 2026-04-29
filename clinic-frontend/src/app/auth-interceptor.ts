import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Ask the browser if we have a logged-in Vet ID saved in memory
  const vetId = localStorage.getItem('vet_id');

  // 2. If we do, clone the outgoing HTTP request and glue the ID to the hidden Headers
  if (vetId) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Vet ${vetId}` // This acts as our VIP pass!
      }
    });
    // 3. Send the modified request to Django
    return next(clonedRequest);
  }

  // If no one is logged in, just let the normal request pass through
  return next(req);
};
