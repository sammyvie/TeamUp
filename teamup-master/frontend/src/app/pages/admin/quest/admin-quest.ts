import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminBackground } from '../admin-background';
import { AdminSidebar } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../../../components/admin-header/admin-header';
import { Footer } from '../../../components/footer/footer';
import { QuestFilter } from './quest-filter/quest-filter';
import { QuestTable } from './quest-table/quest-table';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-quest',
  standalone: true,
  imports: [
    AdminBackground, 
    CommonModule, 
    AdminSidebar, 
    AdminHeader, 
    Footer, 
    QuestFilter, 
    QuestTable
  ],
  templateUrl: './admin-quest.html',
  styleUrl: './admin-quest.css'
})
export class AdminQuest implements OnInit {
  private adminService = inject(AdminService);

  searchTerm = signal<string>('');
  selectedStatus = signal<string>('all');
  dashboardStats = this.adminService.dashboardStats;
  quests = this.adminService.adminQuests; 

  stats = computed(() => {
    const s = this.dashboardStats();
    return [
      { icon: '📊', label: 'Active Quests',    value: s?.questsInProgress?.toLocaleString() ?? '0' },
      { icon: '🔔', label: 'Total Quests',     value: s?.totalQuests?.toLocaleString() ?? '0' },
      { icon: '🏆', label: 'Completed Quests', value: s?.completedQuests?.toLocaleString() ?? '0' },
    ];
  });

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.adminService.getDashboardStats().subscribe();
    this.loadFilteredQuests();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.loadFilteredQuests();
  }

  onStatusChange(status: string): void {
    const lowerStatus = status.toLowerCase();
    let statusSlug = 'all';

    if (lowerStatus.includes('progress')) {
      statusSlug = 'in_progress';
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('open')) {
      statusSlug = 'open';
    } else if (lowerStatus.includes('completed')) {
      statusSlug = 'completed';
    }

    this.selectedStatus.set(statusSlug);
    this.loadFilteredQuests();
  }

  private loadFilteredQuests(): void {
    this.adminService.getQuests(this.selectedStatus(), this.searchTerm()).subscribe({
      error: (err) => console.error('Quest Sync Failed:', err)
    });
  }
}