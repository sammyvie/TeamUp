import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminBackground } from '../admin-background';
import { AdminSidebar } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../../../components/admin-header/admin-header';
import { Footer } from '../../../components/footer/footer';
import { UsersFilter } from './users-filter/users-filter';
import { UsersTable } from './users-table/users-table';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    AdminBackground, 
    CommonModule, 
    AdminSidebar, 
    AdminHeader, 
    Footer, 
    UsersFilter, 
    UsersTable,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
  
  
export class AdminUsers implements OnInit {
  private adminService = inject(AdminService);
  searchTerm = signal<string>('');
  selectedRole = signal<string>('all');
  
  dashboardStats = this.adminService.dashboardStats;
  users = this.adminService.users; 

  stats = computed(() => {
    const s = this.dashboardStats();
    return [
      { icon: '👥', label: 'Total Users',       value: s?.totalUsers?.toLocaleString() ?? '0' },
      { icon: '🧑‍💻', label: 'Total Freelancers', value: s?.totalFreelancers?.toLocaleString() ?? '0' },
      { icon: '📋', label: 'Total Quests',      value: s?.totalQuests?.toLocaleString() ?? '0' },
    ];
  });

  ngOnInit(): void {
    console.log('Initializing User Registry...');
        this.adminService.getDashboardStats().subscribe({
      next: (data) => console.log('Stats Loaded:', data),
      error: (err) => console.error('Stats Error:', err)
    });

    this.loadFilteredUsers();
  }

  refreshData(): void {
    this.adminService.getDashboardStats().subscribe();
    this.loadFilteredUsers();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.loadFilteredUsers();
  }


  onRoleChange(role: string): void {
    const lowerRole = role.toLowerCase();
    let roleSlug = 'all';

    if (lowerRole.includes('freelancer')) {
      roleSlug = 'partyMaster'; 
    } else if (lowerRole.includes('client')) {
      roleSlug = 'commissioner';
    }
    
    this.selectedRole.set(roleSlug);
    this.loadFilteredUsers();
  }

  private loadFilteredUsers(): void {
    this.adminService.getUsers(this.selectedRole(), this.searchTerm()).subscribe({
      error: (err) => console.error('Registry Sync Failed:', err)
    });
  }
}