import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  constructor(private http: HttpClient) {}

  // Test method to verify the interceptor is working
  testAuthHeaders() {
    console.log('=== STARTING AUTH TEST ===');
    console.log('Current token in localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');

    // Make a test request through the interceptor
    return this.http.get(`${environment.apiUrl}/posts`)
      .subscribe({
        next: (response) => {
          console.log('Test request successful:', response);
        },
        error: (error) => {
          console.error('Test request failed with interceptor:', error);
          console.log('Status:', error.status);

          // Since interceptor failed, try a direct request with manually added headers
          this.testManualHeaders();
        }
      });
  }

  // Test with manually added headers (bypassing interceptor)
  testManualHeaders() {
    console.log('=== TESTING WITH MANUAL HEADERS ===');
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token available for manual test');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Manual headers created:', headers.has('Authorization'));
    console.log('Authorization header value:', headers.get('Authorization')?.substring(0, 30) + '...');

    return this.http.get(`${environment.apiUrl}/posts`, { headers })
      .subscribe({
        next: (response) => {
          console.log('Manual headers request successful:', response);
          alert('Manual authorization successful! Interceptor issue detected.');
        },
        error: (error) => {
          console.error('Manual headers request also failed:', error);
          alert('Both interceptor and manual authorization failed. Possible token issue.');
          this.checkTokenFormat();
        }
      });
  }

  // Check token format
  checkTokenFormat() {
    console.log('=== CHECKING TOKEN FORMAT ===');
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token to check');
      return;
    }

    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    console.log('Token contains "Bearer":', token.includes('Bearer'));

    // Try removing Bearer prefix if it's already in the token
    if (token.startsWith('Bearer ')) {
      console.log('Token already has Bearer prefix - this could be the issue!');
      const cleanToken = token.replace('Bearer ', '');
      localStorage.setItem('token', cleanToken);
      console.log('Fixed token - please try again');
      return;
    }

    // Standard JWT format check (simplified)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token does not appear to be in valid JWT format (should have 3 parts separated by dots)');
    } else {
      console.log('Token appears to be in valid JWT format with 3 parts');
    }
  }

  // Check login API response directly
  manualLogin(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          console.log('Manual login response:', response);
          if (response && (response as any).token) {
            console.log('Token in response:', (response as any).token.substring(0, 20) + '...');
          }
        }),
        catchError(error => {
          console.error('Manual login failed:', error);
          return of({ error: 'Login failed' });
        })
      );
  }
}
