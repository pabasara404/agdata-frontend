import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  token: string | null = null;
  submitting = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Get token from URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error = 'Invalid password reset link. Please request a new one.';
      }
    });
  }

  initForm(): void {
    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[a-z]/),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[^a-zA-Z0-9]/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check that passwords match
  passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid || !this.token) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const passwordData = {
      token: this.token,
      password: this.passwordForm.value.password,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.userService.setPassword(passwordData).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.submitting = false;
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else if (err.error && err.error.errors) {
          this.error = Object.values(err.error.errors).join(', ');
        } else {
          this.error = 'An error occurred while setting your password. Please try again.';
        }
        console.error('Error setting password:', err);
      }
    });
  }
}
