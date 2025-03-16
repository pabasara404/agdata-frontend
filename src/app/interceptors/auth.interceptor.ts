import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Debug output
  console.log(`AuthInterceptor running for: ${req.url}`);
  console.log(`Token exists: ${Boolean(token)}`);

  if (token) {
    // Make sure token doesn't already have Bearer prefix
    let tokenValue = token;
    if (tokenValue.startsWith('Bearer ')) {
      console.log('Token already has Bearer prefix, fixing...');
      tokenValue = tokenValue.substring(7);
      localStorage.setItem('token', tokenValue);
    }

    // Clone the request with the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenValue}`
      }
    });

    console.log('Request sent with Authorization header');
    return next(authReq);
  }

  // No token, proceed with the original request
  console.log('No token found, proceeding without Authorization header');
  return next(req);
};
