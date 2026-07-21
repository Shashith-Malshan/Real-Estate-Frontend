import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { NotFoundComponent } from './features/errors/not-found.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { UserRole } from './shared/models';

export const routes: Routes = [
  // Home page
  {
    path: '',
    loadComponent: () => import('./features/marketplace/home/home.component').then(m => m.HomeComponent)
  },

  // Auth routes (no guard needed, available to all)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  // Marketplace (public) routes
  {
    path: 'marketplace',
    loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
  },

  // Buyer Dashboard (authenticated)
  {
    path: 'dashboard',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.BUYER] },
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },

  // Seller routes (seller role required)
  {
    path: 'seller',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SELLER] },
    loadChildren: () => import('./features/seller/seller.routes').then(m => m.SELLER_ROUTES)
  },

  // Admin routes (admin role required)
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Error routes
  {
    path: 'unauthorized',
    loadChildren: () => import('./features/errors/errors.routes').then(m => m.ERRORS_ROUTES)
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },

  // Wildcard route (must be last)
  {
    path: '**',
    component: NotFoundComponent
  }
];
