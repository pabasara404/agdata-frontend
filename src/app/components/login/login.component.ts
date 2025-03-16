import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('LoginComponent initialized');

    // Redirect if already logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      console.log('User is logged in:', isLoggedIn);
      if (isLoggedIn) {
        console.log('Already logged in, redirecting to dashboard');
        this.router.navigate(['/']);
      }
    });

    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const { username, password } = this.loginForm.value;
    console.log('Attempting login for:', username);

    this.authService.login(username, password).subscribe({
      next: (user) => {
        console.log('Login successful for user:', user.username);
        this.submitting = false;

        // Add delay to ensure token is fully stored before navigating
        setTimeout(() => {
          console.log('Navigating to dashboard after login');
          console.log('Token in localStorage:', !!localStorage.getItem('token'));
          this.router.navigate(['/']);
        }, 100);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.submitting = false;
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Invalid username or password';
        }
      }
    });
  }
}
