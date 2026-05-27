import { Component, OnInit, inject, computed, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../../../components/admin-header/admin-header';
import { Footer } from '../../../components/footer/footer';
import { AdminBackground } from '../admin-background';
import { AdminService, UserGrowthData, QuestStatusStat } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminBackground, CommonModule, AdminSidebar, AdminHeader, Footer],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);

  dashboardData = this.adminService.dashboardStats;

  stats = computed(() => {
    const s = this.dashboardData();
    return [
      { label: 'Total Users',       value: s?.totalUsers?.toLocaleString() ?? '0' },
      { label: 'Total Freelancers', value: s?.totalFreelancers?.toLocaleString() ?? '0' },
      { label: 'Total Clients',     value: s?.totalClients?.toLocaleString() ?? '0' },
      { label: 'Total Quests',      value: s?.totalQuests?.toLocaleString() ?? '0' },
    ];
  });

  miniStats = computed(() => {
    const s = this.dashboardData();
    return [
      { label: 'Active Parties',    value: s?.activeParties ?? 0 },
      { label: 'Quest in Progress', value: s?.questsInProgress ?? 0 },
      { label: 'Completed Quest',   value: s?.completedQuests ?? 0 },
    ];
  });

  activities = [
    { initials: 'JD', user: 'System', activity: 'Database Sync Successful', date: 'Just now' },
  ];

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe();
  }

  ngAfterViewInit(): void {
    this.loadChartData();
  }

  private loadChartData(): void {
    this.adminService.getUserGrowth().subscribe(data => {
      this.initGrowthChart(data);
    });

    this.adminService.getQuestStatusStats().subscribe(data => {
      this.initQuestChart(data);
    });
  }

  initGrowthChart(data: UserGrowthData[]): void {
    const labels = data.map(d => `${d._id.month}/${d._id.day}`);
    const counts = data.map(d => d.count);

    new Chart('growthChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'User Signups',
          data: counts,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168,85,247,0.08)',
          tension: 0.4,
          pointBackgroundColor: '#a855f7',
          fill: true
        }]
      },
      options: this.getChartOptions(Math.max(...counts) + 5)
    });
  }

  initQuestChart(data: QuestStatusStat[]): void {
    const labels = data.map(d => d._id.toUpperCase());
    const counts = data.map(d => d.count);

    new Chart('questChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quest Distribution',
          data: counts,
          backgroundColor: 'rgba(244,114,182,0.7)',
          borderRadius: 6
        }]
      },
      options: this.getChartOptions(Math.max(...counts) + 10)
    });
  }

  private getChartOptions(max: number) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(168,85,247,0.08)' }, ticks: { color: 'rgba(200,160,255,0.6)', font: { size: 10, family: 'Orbitron' } } },
        y: { min: 0, max: max, grid: { color: 'rgba(168,85,247,0.08)' }, ticks: { color: 'rgba(200,160,255,0.6)', font: { size: 9, family: 'Orbitron' } } }
      }
    };
  }
}