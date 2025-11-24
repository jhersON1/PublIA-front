import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPassword = signal(false);
  isLoading = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const { name, lastname, email, password } = this.registerForm.value;

      this.authService.register(name!, lastname!, email!, password!)
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigateByUrl('/auth/login');
          },
          error: (message) => {
            this.isLoading.set(false);
            console.error('Register error:', message);
            alert('Registration failed: ' + message);
          }
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
