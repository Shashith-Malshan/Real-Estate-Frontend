import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-error-50 to-warning-50">
      <div class="text-center">
        <mat-icon class="text-6xl mb-4" style="font-size: 80px; width: 80px; height: 80px;">lock</mat-icon>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p class="text-lg text-gray-600 mb-8">
          You don't have permission to access this resource.
        </p>
        <a routerLink="/" class="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
