import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  readonly user      = this.authService.currentUser;
  readonly firstName = computed(() => this.user()?.fullName?.split(' ')[0] ?? 'Adventurer');
  readonly roleLabel = computed(() => {
    const map: Record<string, string> = {
      apprentice:   'Apprentice',
      partyMaster:  'Party Master',
      commissioner: 'Commissioner',
      admin:        'Admin'
    };
    return map[this.user()?.role ?? ''] ?? 'Adventurer';
  });

  logout(): void { this.authService.logout(); }
}