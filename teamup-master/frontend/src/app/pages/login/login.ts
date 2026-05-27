import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  showPass  = signal(false);
  isLoading = signal(false);
  apiError  = signal('');

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])  return `${field === 'email' ? 'Email' : 'Password'} is required.`;
    if (c.errors['email'])     return 'Please enter a valid email address.';
    if (c.errors['minlength']) return 'Password must be at least 6 characters.';
    return 'Invalid input.';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.apiError.set('');

    const { email, password } = this.form.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.redirectByRole(res.user.role);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.apiError.set(err.message ?? 'Login failed. Please try again.');
      }
    });
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'commissioner': this.router.navigate(['/client']);           break;
      case 'partyMaster':  this.router.navigate(['/freelancer']);       break;
      case 'apprentice':   this.router.navigate(['/freelancer']);       break;
      case 'admin':        this.router.navigate(['/admin/dashboard']);  break;
      default:             this.router.navigate(['/dashboard']);
    }
  }
}