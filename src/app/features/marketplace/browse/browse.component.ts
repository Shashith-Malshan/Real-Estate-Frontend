import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyService } from '../../../shared/services/property.service';
import { PropertyDTO, PropertyCategory } from '../../../shared/models';

@Component({
  selector: 'app-browse-properties',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowsePropertiesComponent implements OnInit, OnDestroy {
  properties: PropertyDTO[] = [];
  filteredProperties: PropertyDTO[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Filter properties
  searchTerm = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minBedrooms: number | null = null;

  // Categories for dropdown
  categories = [
    { id: PropertyCategory.RESIDENTIAL, name: 'Residential' },
    { id: PropertyCategory.COMMERCIAL, name: 'Commercial' },
    { id: PropertyCategory.LAND, name: 'Land' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.propertyService
      .getAllProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.properties = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load properties. Please try again.';
          console.error('Error loading properties:', err);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((property) => {
      // Search term filter (title, location)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesSearch =
          property.title.toLowerCase().includes(term) ||
          property.location.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (this.selectedCategory && property.categoryId !== this.selectedCategory) {
        return false;
      }

      // Price range filter
      if (this.minPrice && property.price < this.minPrice) {
        return false;
      }
      if (this.maxPrice && property.price > this.maxPrice) {
        return false;
      }

      // Bedrooms filter
      if (this.minBedrooms && property.bedrooms < this.minBedrooms) {
        return false;
      }

      return true;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onBedroomsChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.minBedrooms = null;
    this.applyFilters();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getPropertyBedrooms(property: PropertyDTO): number {
    return property.bedroomCount ?? 0;
  }

  getPropertyBathrooms(property: PropertyDTO): number {
    return property.bathroomCount ?? 0;
  }

  getPropertyPrice(property: PropertyDTO): number {
    return property.price ?? 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}
