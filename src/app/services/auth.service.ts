import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));
  isAdmin$ = this.currentUser$.pipe(map(user => user?.isAdmin ?? false));
  token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<User> {
    console.log(`Attempting login for: ${username}`);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          console.log('Login successful, got response');

          // Make sure we don't store a token that already has Bearer prefix
          let tokenValue = response.token;
          if (tokenValue.startsWith('Bearer ')) {
            console.log('Response token has Bearer prefix, removing it');
            tokenValue = tokenValue.substring(7);
          }

          console.log(`Token length: ${tokenValue.length}`);

          // Store both token and user in localStorage
          localStorage.setItem('token', tokenValue);
          localStorage.setItem('currentUser', JSON.stringify(response.user));

          // Update BehaviorSubjects
          this.currentUserSubject.next(response.user);
          this.tokenSubject.next(tokenValue);
        }),
        map(response => response.user),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('currentUser');

      console.log('Loading from storage: token exists:', !!token, 'user exists:', !!userJson);

      if (token && userJson) {
        // Clean token if it already has Bearer prefix
        let cleanToken = token;
        if (token.startsWith('Bearer ')) {
          console.log('Stored token has Bearer prefix, cleaning it');
          cleanToken = token.substring(7);
          localStorage.setItem('token', cleanToken);
        }

        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(cleanToken);

        console.log('Loaded user from storage:', user.username);
      } else {
        console.log('No credentials found in storage');
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.logout();
    }
  }
}
