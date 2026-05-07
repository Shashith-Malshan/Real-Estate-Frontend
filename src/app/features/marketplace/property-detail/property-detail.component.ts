import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  template: `
    <div class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Property Details</h1>
        <div class="bg-white rounded-lg shadow p-8">
          <div class="h-96 bg-gray-200 rounded mb-8"></div>
          <p class="text-gray-600">Property ID: {{ propertyId }}</p>
          <p class="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  `
})
export class PropertyDetailComponent {
  propertyId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.propertyId = this.route.snapshot.paramMap.get('id');
  }
}
