import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientBackground } from '../client-background';
import { Navbar } from '../../../components/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import { QuestService, Quest } from '../../../core/services/quest.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-client-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, Navbar, ClientBackground],
  templateUrl: './client-overview.html',
  styleUrl: './client-overview.css'
})
export class ClientOverview implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly questService = inject(QuestService);
  private readonly taskService = inject(TaskService);
  private readonly profileService = inject(ProfileService);
  readonly user = this.authService.currentUser;
  readonly firstName = computed(() =>
    this.user()?.fullName?.split(', ') ?? 'Adventurer'
  );

  private readonly allQuests = this.questService.quests; 
  readonly activeTasks = this.taskService.currentQuestTasks; 
  readonly clientQuests = computed(() => {
    const userId = this.user()?._id;
    return this.allQuests().filter(q => this.getEntityId(q.commissioner) === userId);
  });

  readonly activeQuest = computed(() => {
    return this.clientQuests().find(q => q.status === 'in_progress') ?? null;
  });

  readonly stats = computed(() => {
    const quests = this.clientQuests();
    return {
      questsDone: quests.filter(q => q.status === 'completed').length,
      activeQuests: quests.filter(q => q.status === 'in_progress' || q.status === 'open').length
    };
  });

  readonly milestones = computed(() => {
    return this.activeTasks().map(t => ({
      id: t._id,
      label: t.name,
      done: t.status === 'done'
    }));
  });

  readonly questProgressList = computed(() => {
    return this.clientQuests()
      .sort((a, b) => b._id.localeCompare(a._id)) 
      .slice(0, 3)
      .map(q => ({
        id: q._id,
        title: q.title,
        deadline: q.deadline,
        status: q.status, 
        difficulty: q.techStack.length > 3 ? 'hard' : 'medium'
      }));
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.profileService.fetchProfile().subscribe(u => {
      if (!u) return;
      
      this.questService.getQuests().subscribe(quests => {
        const active = quests.find(q => 
          this.getEntityId(q.commissioner) === u._id && q.status === 'in_progress'
        );
        
        if (active) {
          this.taskService.getTasksByQuest(active._id).subscribe();
        }
      });
    });
  }
  
  private getEntityId(entity: any): string | undefined {
    if (!entity) return undefined;
    return typeof entity === 'object' ? entity._id : entity;
  }

  isPopulated(party: any): party is { name: string } {
    return !!party && typeof party === 'object' && 'name' in party;
  }

  logout(): void {
    this.authService.logout();
  }
}