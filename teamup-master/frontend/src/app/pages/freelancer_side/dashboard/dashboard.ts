import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Navbar } from '../../../components/navbar/navbar';
import { FreelancerBackground } from '../freelancer-background';
import { ProfileService } from '../../../core/services/profile.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { PartyService } from '../../../core/services/party.service';
import { QuestService } from '../../../core/services/quest.service';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, FreelancerBackground],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class FreelancerDashboard implements OnInit {
  private profileService = inject(ProfileService);
  private taskService = inject(TaskService);
  private partyService = inject(PartyService);
  private questService = inject(QuestService);
  private router = inject(Router);

  user = this.profileService.currentUser;
  tasks = this.taskService.currentQuestTasks;
  showLeaveModal = false;
  role = computed(() => this.user()?.role);

  userName = computed(() => this.user()?.fullName?.split(', ') || 'Freelancer');
  level = computed(() => this.user()?.level || 1);
  exp = computed(() => this.user()?.exp || 0);
  
  expMax = computed(() => { // wait
    const lvl = this.level();
    if (lvl <= 5) return 4000;
    if (lvl <= 10) return 10000;
    return 25000;
  });

  expPercentage = computed(() => (this.exp() / this.expMax()) * 100); // wait

  activeTasks = computed(() => {
    return this.tasks()
      .filter(t => t.status === 'todo')
      .slice(0, 3);
  });

  ngOnInit(): void {
    this.loadDashboardData();
    this.taskService.clearTasks();
  }

  private loadDashboardData(): void {
    this.profileService.fetchProfile().subscribe(userData => {
      const partyId = typeof userData?.currentParty === 'object' 
        ? userData.currentParty?._id 
        : userData?.currentParty;

      if (partyId) {
        this.questService.getQuestsByParty(partyId).subscribe(quests => {
          const activeQuest = quests.find(q => q.status === 'in_progress');
          if (activeQuest) {
            this.taskService.getTasksByQuest(activeQuest._id).subscribe();
          }
        });
      }
    });
  }

  leaveParty(): void {
    if (!this.user()?.currentParty) return;
    this.showLeaveModal = true;
  }

  confirmLeave(): void {
    const partyId = typeof this.user()?.currentParty === 'object' 
      ? (this.user()?.currentParty as any)._id 
      : this.user()?.currentParty;

    if (partyId) {
      this.partyService.leaveParty(partyId).subscribe({
        next: () => {
          this.showLeaveModal = false;
          this.profileService.fetchProfile().subscribe();
          this.router.navigate(['/freelancer/party-hub']);
        },
        error: (err) => alert(err.error?.message || "Extraction failed.")
      });
    }
  }
}