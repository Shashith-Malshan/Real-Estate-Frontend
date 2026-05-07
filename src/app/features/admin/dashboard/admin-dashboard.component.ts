import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div class="grid md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-lg mb-2">Total Users</h3>
            <p class="text-2xl font-bold text-primary-600">0</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-lg mb-2">Total Properties</h3>
            <p class="text-2xl font-bold text-secondary-600">0</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-lg mb-2">Total Deals</h3>
            <p class="text-2xl font-bold text-success-600">0</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-lg mb-2">Platform Revenue</h3>
            <p class="text-2xl font-bold text-warning-600">$0</p>
          </div>
        </div>
        <p class="text-gray-600 mt-8">Coming soon...</p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}
