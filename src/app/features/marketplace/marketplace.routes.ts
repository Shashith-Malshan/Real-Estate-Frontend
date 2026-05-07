import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BrowsePropertiesComponent } from './browse/browse.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'browse',
    component: BrowsePropertiesComponent
  },
  {
    path: 'property/:id',
    component: PropertyDetailComponent
  }
];
