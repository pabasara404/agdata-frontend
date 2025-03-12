import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { UserService } from '../services/user.service';
import { User, UserCreate } from '../models/user';
import { UserDetailComponent } from '../user-detail/user-detail.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserDetailComponent]
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  loading = true;

  userForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe(users => {
        this.users = users;
        this.filteredUsers = users;
      });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.userService.getUserById(user.id!).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    searchTerm = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const newUser = this.userForm.value as UserCreate;

    this.userService.createUser(newUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.users.push(user);
          this.filteredUsers = [...this.users];
          this.userForm.reset();
          alert('User created successfully');
        },
        error: (err) => {
          console.error('Error creating user:', err);
          alert('Error creating user');
        }
      });
  }

  trackByUserId(index: number, user: User): number {
    return user.id!;
  }
}
