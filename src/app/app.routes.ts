import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { SetPasswordComponent } from './components/set-password/set-password.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'posts', component: PostListComponent, canActivate: [authGuard] }, // Only authGuard, no adminGuard
  { path: 'users', component: UserListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'users/create', component: UserFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'users/:id/edit', component: UserFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'set-password', component: SetPasswordComponent },
  { path: '**', redirectTo: 'dashboard' }
];
