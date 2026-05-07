import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './dashboard/seller-dashboard.component';
import { ListPropertyComponent } from './list-property/list-property.component';
import { UserRole } from '../../shared/models';
import { RoleGuard } from '../../shared/guards';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SELLER] }
  },
  {
    path: 'list',
    component: ListPropertyComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SELLER] }
  }
];
