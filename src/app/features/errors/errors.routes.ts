import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized.component';
import { NotFoundComponent } from './not-found.component';

export const ERRORS_ROUTES: Routes = [
  {
    path: '',
    component: UnauthorizedComponent
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  }
];
