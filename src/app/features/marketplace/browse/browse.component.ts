import { Component } from '@angular/core';

@Component({
  selector: 'app-browse-properties',
  standalone: true,
  template: `
    <div class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Browse Properties</h1>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="h-48 bg-gray-200 rounded mb-4"></div>
            <h3 class="font-semibold text-lg">Property Listing</h3>
            <p class="text-gray-600">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BrowsePropertiesComponent {}
