import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './list-property.component.html',
  styleUrl: './list-property.component.css'
})
export class ListPropertyComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  imageValidationError: string | null = null;
  selectedFiles: File[] = [];
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const val = this.form.get('propertyCategoryId')?.value;
    return val != null ? Number(val) : null;
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
    const id = Number(categoryId);
    // Patch the form control so selectedCategory getter stays in sync
    this.form.patchValue({ propertyCategoryId: id });

    // Remove all sub-groups
    this.form.removeControl('residential');
    this.form.removeControl('commercial');
    this.form.removeControl('land');

    // Add the appropriate sub-group
    if (id === PropertyCategory.RESIDENTIAL) {
      this.form.addControl('residential', this.fb.group({
        price: [null, [Validators.required, Validators.min(0.01)]],
        bedroomCount: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
        bathroomCount: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
        residentialType: ['', Validators.required],
        residentialStatus: ['', Validators.required]
      }));
    } else if (id === PropertyCategory.COMMERCIAL) {
      this.form.addControl('commercial', this.fb.group({
        price: [null, [Validators.required, Validators.min(0.01)]],
        floorSize: [null, [Validators.required, Validators.min(0.01)]],
        commercialType: ['', Validators.required],
        commercialStatus: ['', Validators.required]
      }));
    } else if (id === PropertyCategory.LAND) {
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

    // Convert selected files to base64 and submit
    this.convertFilesToBase64(this.selectedFiles).then((base64Images) => {
      const formValue = this.form.value;
      const categoryId: number = Number(formValue.propertyCategoryId);

      const dto: PropertyCreateDTO = {
        title: formValue.title,
        description: formValue.description,
        location: formValue.location,
        district: formValue.district,
        propertyCategoryId: categoryId,
        sellerId: currentUser.sellerId,
        imageDataList: base64Images.length > 0 ? base64Images : undefined
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
    }).catch((err) => {
      this.isSubmitting = false;
      this.errorMessage = 'Error processing images. Please try again.';
      console.error('Image conversion error:', err);
    });
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    this.imageValidationError = null;

    if (!files || files.length === 0) {
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        this.imageValidationError = `Invalid file type: "${file.name}". Only JPG, PNG, GIF, and WebP are allowed.`;
        return;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        this.imageValidationError = `File "${file.name}" is too large. Max size is 10MB.`;
        return;
      }

      validFiles.push(file);
    }

    // Check total number of images
    if (this.selectedFiles.length + validFiles.length > 10) {
      this.imageValidationError = 'Maximum 10 images allowed per property.';
      return;
    }

    // Add valid files to selected list
    this.selectedFiles = [...this.selectedFiles, ...validFiles];

    // Reset file input
    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imageValidationError = null;
  }

  private async convertFilesToBase64(files: File[]): Promise<string[]> {
    const base64Strings: string[] = [];

    for (const file of files) {
      const base64 = await this.fileToBase64(file);
      base64Strings.push(base64);
    }

    return base64Strings;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  getSubControl(group: string, name: string): AbstractControl | null {
    return this.form.get(group)?.get(name) ?? null;
  }
}
