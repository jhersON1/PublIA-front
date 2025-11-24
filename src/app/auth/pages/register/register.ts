import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);

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
      console.log('Register data:', this.registerForm.value);
      // Simulate API call
      setTimeout(() => {
        this.isLoading.set(false);
      }, 2000);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
