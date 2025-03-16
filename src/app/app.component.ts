import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AgData User Management';

  constructor(
    public authService: AuthService,
    private http: HttpClient
  ) {}

  logout(): void {
    this.authService.logout();
  }

  testAuth(): void {
    console.log('Testing authentication...');
    console.log('Token in localStorage:', localStorage.getItem('token') ? 'Exists' : 'None');

    // Make a test request to the posts API
    this.http.get(`${environment.apiUrl}/posts`).subscribe({
      next: (data) => {
        console.log('API request successful:', data);
        alert('Authentication working correctly!');
      },
      error: (err) => {
        console.error('API request failed:', err);

        // If we get a 401, check the token
        if (err.status === 401) {
          console.log('Getting 401 Unauthorized - checking token format');
          this.checkToken();
        }
      }
    });
  }

  private checkToken(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token in localStorage');
      return;
    }

    // Log token details
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    // Check if token already has Bearer prefix
    if (token.startsWith('Bearer ')) {
      console.log('Token already has Bearer prefix - this could be causing issues!');
      // Remove Bearer prefix and save back to localStorage
      const fixedToken = token.substring(7);
      localStorage.setItem('token', fixedToken);
      console.log('Token fixed, try again');
    }
  }

  protected readonly localStorage = localStorage;
}
