import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css'
})
export class AdminHeader {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}