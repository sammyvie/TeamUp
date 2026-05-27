import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly user      = this.authService.currentUser;
  readonly userRole  = this.authService.userRole;

  readonly navLinks = computed(() => {
    const role = this.userRole();

    if (role === 'commissioner') {
      return [
        { label: 'Dashboard',    path: '/client'              },
        { label: 'Profile',      path: '/client/profile'      },
        { label: 'Quest Hub',    path: '/client/quest-hub'    },
        { label: 'Quest Board',  path: '/client/quest-board'  },
      ];
    }

    if (role === 'partyMaster' || role === 'apprentice') {
      return [
        { label: 'Dashboard',    path: '/freelancer'              },
        { label: 'Profile',      path: '/freelancer/profile'      },
        { label: 'Party Hub',    path: '/freelancer/party-hub'    },
        { label: 'Quests Board', path: '/freelancer/quests-board' },
        { label: 'Quests',       path: '/freelancer/quests'       },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Users',     path: '/admin/users'     },
        { label: 'Quests',    path: '/admin/quest'     },
        { label: 'Chat Logs', path: '/admin/chat-logs' },
      ];
    }

    return [{ label: 'Dashboard', path: '/dashboard' }];
  });

  logout(): void {
    this.authService.logout();
  }
}