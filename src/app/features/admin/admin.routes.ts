import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { UserRole } from '../../shared/models';
import { RoleGuard } from '../../shared/guards';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  }
];
