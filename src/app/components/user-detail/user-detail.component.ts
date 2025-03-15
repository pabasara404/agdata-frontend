import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UserModel, UserUpdate } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserDetailComponent implements OnInit, OnDestroy {
  @Input() userId!: number;

  user: UserModel | null = null;
  loading = false;

  editForm: FormGroup;

  editMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadUser();

    // Subscribe to user changes
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.editForm.patchValue({
            email: user.email
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getUserById(this.userId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  get isAdmin(): boolean {
    return this.user?.isAdmin || false;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.editForm.patchValue({
        email: this.user?.email
      });
    }
  }

  saveChanges(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    if (!this.user) return;

    const updatedUser: UserUpdate = {
      email: this.editForm.value.email
    };

    this.userService.updateUser(this.userId, updatedUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editMode = false;
          alert('UserModel updated successfully');
          this.loadUser(); // Reload the user data
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert('Error updating user');
        }
      });
  }
}
