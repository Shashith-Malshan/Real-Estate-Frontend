import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-br from-primary-50 to-secondary-50">
      <!-- Hero Section -->
      <section class="py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Property
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover properties from trusted sellers, schedule visits, and make your dream home a reality.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/marketplace/browse" 
               class="px-8 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow">
              Browse Properties
            </a>
            <a routerLink="/register" 
               class="px-8 py-3 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="p-6 rounded-lg bg-primary-50">
              <div class="text-4xl mb-4">🔍</div>
              <h3 class="text-xl font-semibold mb-2">Browse</h3>
              <p class="text-gray-600">Explore hundreds of properties available in your area.</p>
            </div>
            <div class="p-6 rounded-lg bg-secondary-50">
              <div class="text-4xl mb-4">📅</div>
              <h3 class="text-xl font-semibold mb-2">Schedule</h3>
              <p class="text-gray-600">Book property visits at your convenience.</p>
            </div>
            <div class="p-6 rounded-lg bg-success-50">
              <div class="text-4xl mb-4">✨</div>
              <h3 class="text-xl font-semibold mb-2">Connect</h3>
              <p class="text-gray-600">Communicate directly with sellers about deals.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Ready to Start?</h2>
          <p class="text-lg text-gray-600 mb-8">
            Create an account and start your property search today.
          </p>
          <a routerLink="/register"
             class="inline-block px-8 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow">
            Register Now
          </a>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {}
