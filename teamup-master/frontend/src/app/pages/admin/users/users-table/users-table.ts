import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css'
})
export class UsersTable {
  @Input() users: User[] = [];

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  calculateRank(level: number | undefined): string {
    const lvl = level ?? 0;
    if (lvl >= 15) return 'Platinum';
    if (lvl >= 10) return 'Gold';
    if (lvl >= 5) return 'Silver';
    return 'Bronze';
  }
}