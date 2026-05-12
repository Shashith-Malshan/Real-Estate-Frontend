import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize, timeout } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRegistrationDTO, UserRole } from '../../../shared/models';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  selectedRole = UserRole.BUYER;
  userRoles = UserRole;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      this.router.navigateByUrl(this.authService.getDashboardRouteForRole(currentUser?.activeRoleId));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      contact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nic: ['', [Validators.required, Validators.minLength(9)]],
      role: [UserRole.BUYER, Validators.required],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const registrationData: UserRegistrationDTO = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      username: formValue.username,
      password: formValue.password,
      contact: formValue.contact,
      nic: formValue.nic,
      roleId: formValue.role
    };

    this.authService.register(registrationData)
      .pipe(
        takeUntil(this.destroy$),
        timeout(15000),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful! Redirecting to your dashboard...';
          setTimeout(() => {
            this.router.navigateByUrl(this.authService.getDashboardRouteForRole(response.activeRoleId));
          }, 2000);
        },
        error: (error) => {
          if (error?.name === 'TimeoutError') {
            this.errorMessage = 'Registration request timed out. Please verify the backend is running and try again.';
            return;
          }

          if (error?.status === 0) {
            this.errorMessage = 'Cannot reach backend. Check API server status and CORS/security configuration.';
            return;
          }

          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  setRole(role: UserRole): void {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
  }

  // Form control getters
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get contact() {
    return this.registerForm.get('contact');
  }

  get nic() {
    return this.registerForm.get('nic');
  }

  get termsAccepted() {
    return this.registerForm.get('termsAccepted');
  }

  get passwordMismatch(): boolean {
    return (this.registerForm.hasError('passwordMismatch') ?? false) && 
           ((this.password?.touched ?? false) || (this.confirmPassword?.touched ?? false));
  }
}
