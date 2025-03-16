import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { User, UpdateUserDto } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class UserDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() userId!: number | null;

  user: User | null = null;
  loading = false;
  loadingPosts = false;
  postCount = 0;

  editForm: FormGroup;

  editMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private postService: PostService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadUserPostCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When userId changes, reload data
    if (changes['userId'] && !changes['userId'].firstChange) {
      // Reset UI state
      this.editMode = false;
      this.user = null;

      // Load new data
      this.loadUser();
      this.loadUserPostCount();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(): void {
    if (!this.userId) {
      return;
    }

    this.loading = true;
    this.userService.getUserById(this.userId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          if (user) {
            this.editForm.patchValue({
              email: user.email
            });
          }
        },
        error: (err) => {
          console.error('Error loading user:', err);
        }
      });
  }

  loadUserPostCount(): void {
    if (!this.userId) {
      return;
    }

    this.loadingPosts = true;
    this.postService.getPostsByUserId(this.userId)
      .pipe(
        finalize(() => this.loadingPosts = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (posts) => {
          this.postCount = posts.length;
        },
        error: (err) => {
          console.error('Error loading post count:', err);
        }
      });
  }

  get isAdmin(): boolean {
    return this.user?.isAdmin || false;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.user) {
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

    if (!this.user || !this.userId) return;

    const updatedUser: UpdateUserDto = {
      email: this.editForm.value.email
    };

    this.userService.updateUser(this.userId, updatedUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editMode = false;
          alert('User updated successfully');
          this.loadUser(); // Reload the user data
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert('Error updating user');
        }
      });
  }
}
