import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

// 🔧 TEMP: Admin credentials for frontend simulation
// When backend is ready: remove these and validate server-side
const ADMIN_EMAIL    = 'admin@teamup.com';
const ADMIN_PASSWORD = 'teamup-admin1234';
const ADMIN_SECRET   = 'teamup-admin1234';

@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  showPass   = signal(false);
  showSecret = signal(false);
  isLoading  = signal(false);
  apiError   = signal('');

  form = this.fb.group({
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(6)]],
    adminSecret: ['', Validators.required],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { email, password, adminSecret } = this.form.value;

    // ── Validate secret code ──
    if (adminSecret !== ADMIN_SECRET) {
      this.apiError.set('Invalid admin access code.');
      return;
    }

    // ── Validate email + password ──
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      this.apiError.set('Invalid admin email or password.');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set('');

    // ─────────────────────────────────────────────────────────────────
    // 🔧 TEMP: Simulation mode — no backend needed
    // When backend is ready:
    //   1. Remove the simulation block below
    //   2. Uncomment the real authService.login() call
    //   3. Remove ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET constants
    //   4. Move all validation to the backend
    // ─────────────────────────────────────────────────────────────────

    // SIMULATION: pretend login succeeded for admin
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/admin/dashboard']);
    }, 800);

    // REAL (uncomment when backend ready):
    // this.authService.login({ email: email!, password: password! }).subscribe({
    //   next: (res) => {
    //     this.isLoading.set(false);
    //     if (res.user.role !== 'admin') {
    //       this.apiError.set('Access denied. This portal is for admins only.');
    //       this.authService.logout();
    //       return;
    //     }
    //     this.router.navigate(['/admin/dashboard']);
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //     this.apiError.set(err.message ?? 'Login failed.');
    //   }
    // });
  }
}