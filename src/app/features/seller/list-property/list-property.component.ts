import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../../shared/services/property.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PropertyCreateDTO, PropertyCategory } from '../../../shared/models';

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

@Component({
  selector: 'app-list-property',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './list-property.component.html',
  styleUrl: './list-property.component.css'
})
export class ListPropertyComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  districts = SRI_LANKA_DISTRICTS;
  PropertyCategory = PropertyCategory;

  categories = [
    { id: PropertyCategory.RESIDENTIAL, name: 'Residential' },
    { id: PropertyCategory.COMMERCIAL, name: 'Commercial' },
    { id: PropertyCategory.LAND, name: 'Land' }
  ];

  residentialTypes = ['house', 'apartment'];
  residentialStatuses = ['ongoing', 'completed'];
  commercialTypes = ['office', 'shopping center', 'restaurant', 'hotel'];
  commercialStatuses = ['ongoing', 'completed'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      district: ['', Validators.required],
      propertyCategoryId: [null, Validators.required]
    });
  }

  get selectedCategory(): number | null {
    return this.form.get('propertyCategoryId')?.value ?? null;
  }

  get residentialGroup(): FormGroup | null {
    return this.form.get('residential') as FormGroup | null;
  }

  get commercialGroup(): FormGroup | null {
    return this.form.get('commercial') as FormGroup | null;
  }

  get landGroup(): FormGroup | null {
    return this.form.get('land') as FormGroup | null;
  }

  onCategoryChange(categoryId: number): void {
    // Remove all sub-groups
    this.form.removeControl('residential');
    this.form.removeControl('commercial');
    this.form.removeControl('land');

    // Add the appropriate sub-group
    if (categoryId === PropertyCategory.RESIDENTIAL) {
      this.form.addControl('residential', this.fb.group({
        price: [null, [Validators.required, Validators.min(0.01)]],
        bedroomCount: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
        bathroomCount: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
        residentialType: ['', Validators.required],
        residentialStatus: ['', Validators.required]
      }));
    } else if (categoryId === PropertyCategory.COMMERCIAL) {
      this.form.addControl('commercial', this.fb.group({
        price: [null, [Validators.required, Validators.min(0.01)]],
        floorSize: [null, [Validators.required, Validators.min(0.01)]],
        commercialType: ['', Validators.required],
        commercialStatus: ['', Validators.required]
      }));
    } else if (categoryId === PropertyCategory.LAND) {
      this.form.addControl('land', this.fb.group({
        plotCount: [null, [Validators.required, Validators.min(1)]],
        unitPrice: [null, [Validators.required, Validators.min(0.01)]]
      }));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'You must be logged in to list a property.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.form.value;
    const categoryId: number = formValue.propertyCategoryId;

    const dto: PropertyCreateDTO = {
      title: formValue.title,
      description: formValue.description,
      location: formValue.location,
      district: formValue.district,
      propertyCategoryId: categoryId,
      sellerId: currentUser.sellerId
    };

    // Merge category-specific fields
    if (categoryId === PropertyCategory.RESIDENTIAL && formValue.residential) {
      Object.assign(dto, formValue.residential);
    } else if (categoryId === PropertyCategory.COMMERCIAL && formValue.commercial) {
      Object.assign(dto, formValue.commercial);
    } else if (categoryId === PropertyCategory.LAND && formValue.land) {
      Object.assign(dto, formValue.land);
    }

    this.propertyService.createProperty(dto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Property listed successfully!', 'Close', { duration: 5000 });
          this.router.navigate(['/seller']);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Server error — please try again.';
        }
      });
  }

  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  getSubControl(group: string, name: string): AbstractControl | null {
    return this.form.get(group)?.get(name) ?? null;
  }
}
