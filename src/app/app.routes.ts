import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { SetPasswordComponent } from './components/set-password/set-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'users/create', component: UserFormComponent },
  { path: 'users/:id/edit', component: UserFormComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: '**', redirectTo: 'users' }
];
