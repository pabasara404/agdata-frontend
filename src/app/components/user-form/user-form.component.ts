import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.isEditMode = true;
        this.loadUser(this.userId);
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      notificationPreferences: this.fb.group({
        emailEnabled: [true],
        slackEnabled: [false],
        slackWebhookUrl: ['']
      })
    });

    // If in edit mode, make username read-only
    if (this.isEditMode) {
      this.userForm.get('username')?.disable();
    }

    // Conditionally show/hide slackWebhookUrl based on slackEnabled
    this.userForm.get('notificationPreferences.slackEnabled')?.valueChanges
      .subscribe(value => {
        const slackWebhookControl = this.userForm.get('notificationPreferences.slackWebhookUrl');
        if (value) {
          slackWebhookControl?.setValidators([Validators.required, Validators.pattern('https://hooks\\.slack\\.com/.*')]);
        } else {
          slackWebhookControl?.clearValidators();
        }
        slackWebhookControl?.updateValueAndValidity();
      });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          notificationPreferences: {
            emailEnabled: user.notificationPreferences?.emailEnabled ?? true,
            slackEnabled: user.notificationPreferences?.slackEnabled ?? false,
            slackWebhookUrl: user.notificationPreferences?.slackWebhookUrl ?? ''
          }
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user details. Please try again.';
        this.loading = false;
        console.error('Error loading user:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.userForm.getRawValue();

    if (this.isEditMode && this.userId) {
      // Update existing user
      const updateData: UpdateUserDto = {
        email: formValue.email,
        notificationPreferences: formValue.notificationPreferences
      };

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'User updated successfully!';
          setTimeout(() => this.router.navigate(['/users']), 1500);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      // Create new user
      const createData: CreateUserDto = {
        username: formValue.username,
        email: formValue.email,
        notificationPreferences: formValue.notificationPreferences
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'User created successfully! A password setup email has been sent if email notifications are enabled.';
          setTimeout(() => this.router.navigate(['/users']), 1500);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  handleError(err: any): void {
    this.submitting = false;
    if (err.error && err.error.errors) {
      this.error = Object.values(err.error.errors).join(', ');
    } else if (err.error && typeof err.error === 'string') {
      this.error = err.error;
    } else {
      this.error = 'An error occurred. Please try again.';
    }
    console.error('Error submitting form:', err);
  }

  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
