import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card mt-3 mb-3">
      <div class="card-header bg-info text-white">
        Auth Debug Panel
        <button class="btn btn-sm btn-light float-end" (click)="toggleExpanded()">
          {{ expanded ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div class="card-body" *ngIf="expanded">
        <div class="mb-2">
          <strong>Logged In:</strong> {{ isLoggedIn ? 'Yes' : 'No' }}
        </div>
        <div class="mb-2">
          <strong>Is Admin:</strong> {{ isAdmin ? 'Yes' : 'No' }}
        </div>
        <div class="mb-2">
          <strong>User:</strong> {{ currentUser ? currentUser.username : 'None' }}
        </div>
        <div class="mb-2">
          <strong>Token:</strong>
          <span *ngIf="token" class="text-success">{{ token.substring(0, 20) }}...</span>
          <span *ngIf="!token" class="text-danger">No token found</span>
        </div>
        <div class="mb-2">
          <strong>LocalStorage Token:</strong>
          <span *ngIf="localStorageToken" class="text-success">{{ localStorageToken.substring(0, 20) }}...</span>
          <span *ngIf="!localStorageToken" class="text-danger">No token in localStorage</span>
        </div>
        <div class="mb-2">
          <strong>LocalStorage User:</strong>
          <span *ngIf="localStorageUser" class="text-success">Found</span>
          <span *ngIf="!localStorageUser" class="text-danger">No user in localStorage</span>
        </div>
        <div class="mt-3">
          <button class="btn btn-sm btn-primary me-2" (click)="refreshData()">Refresh Data</button>
          <button class="btn btn-sm btn-danger" (click)="clearStorage()">Clear Storage</button>
        </div>
      </div>
    </div>
  `
})
export class AuthDebugComponent implements OnInit {
  expanded = false;
  isLoggedIn = false;
  isAdmin = false;
  currentUser: any = null;
  token: string | null = null;
  localStorageToken: string | null = null;
  localStorageUser: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshData();

    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.isAdmin$.subscribe(admin => {
      this.isAdmin = admin;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.token$.subscribe(token => {
      this.token = token;
    });
  }

  refreshData(): void {
    this.localStorageToken = localStorage.getItem('token');
    this.localStorageUser = localStorage.getItem('currentUser');
  }

  clearStorage(): void {
    if (confirm('Are you sure you want to clear all authentication data?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.refreshData();
      window.location.reload();
    }
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.refreshData();
    }
  }
}
