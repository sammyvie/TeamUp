import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../components/navbar/navbar';
import { ClientBackground } from '../client-background';
import { ProfileService } from '../../../core/services/profile.service';
import { QuestService, Quest } from '../../../core/services/quest.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { PartyService } from '../../../core/services/party.service'; // Ensure this exists

@Component({
  selector: 'app-client-quest-board',
  standalone: true,
  imports: [CommonModule, Navbar, ClientBackground],
  templateUrl: './client-quest-board.html',
  styleUrl: './client-quest-board.css'
})
export class ClientQuestBoard implements OnInit {
  private profileService = inject(ProfileService);
  private questService = inject(QuestService);
  private taskService = inject(TaskService);
  private partyService = inject(PartyService); // 1. Inject PartyService

  // --- State Signals ---
  user = this.profileService.currentUser;
  activeQuest = signal<Quest | null>(null);
  activePartyName = signal<string>('Deployment Pending'); // 2. New signal for the name
  tasks = this.taskService.currentQuestTasks;

  // --- Computed Data ---
  milestones = computed(() => {
    return this.tasks().map(t => ({
      name: `Objective ${t.taskNum}`,
      description: t.name,
      status: t.status === 'done' ? 'Completed' : 'In Progress'
    }));
  });

  questProgress = computed(() => {
    const list = this.milestones();
    if (list.length === 0) return 0;
    const completed = list.filter(m => m.status === 'Completed').length;
    return Math.floor((completed / list.length) * 100);
  });

  clientName = computed(() => this.user()?.fullName || 'You');
  
  partyMasterName = computed(() => {
    const quest = this.activeQuest();
    const partyObj = quest?.party as any; 
    return partyObj?.partyMaster?.fullName || 'Party Master';
  });

  activityLogs = computed(() => {
    return this.tasks().map(t => ({
      initials: t.status === 'done' ? 'PTY' : 'SYS',
      text: t.status === 'done' 
        ? `Party marked "${t.name}" as Resolved.` 
        : `New objective "${t.name}" deployed to the board.`,
      time: t.createdAt
    })).slice(0, 5); 
  });

  messages = computed(() => {
    const masterName = this.partyMasterName();
    const cName = this.clientName();
    const rawMessages = [
      { sender: 'party', name: masterName, text: 'Hey, just finished the wireframes for the dashboard. Can you check and approve them?' },
      { sender: 'client', name: 'You', text: 'Looks great! The layout is clean. Approved. You can proceed to frontend development.' },
      { sender: 'party', name: masterName, text: "Thanks! We've started on the Angular components. The sidebar and header are done." },
      { sender: 'client', name: 'You', text: 'Perfect. Make sure the color theme matches the design specs I sent earlier.' },
    ];

    return rawMessages.map(msg => ({
      ...msg,
      initials: this.generateInitials(msg.sender === 'party' ? masterName : cName)
    }));
  });

  ngOnInit(): void {
    this.loadClientData();
  }

  // --- Helpers ---
  isPopulated(party: any): party is { name: string } {
    return !!party && typeof party === 'object' && 'name' in party;
  }

  private getEntityId(entity: any): string | undefined {
    if (!entity) return undefined;
    return typeof entity === 'object' ? entity._id : entity;
  }

  private loadClientData(): void {
    this.profileService.fetchProfile().subscribe(u => {
      if (!u || !u._id) return;

      this.questService.getQuests().subscribe(allQuests => {
        const active = allQuests.find(q => {
          const commissionerId = this.getEntityId(q.commissioner);
          return commissionerId === u._id && q.status === 'in_progress';
        });

        if (active) {
          this.activeQuest.set(active);
          this.taskService.getTasksByQuest(active._id).subscribe();

          if (this.isPopulated(active.party)) {
            this.activePartyName.set(active.party.name);
          } else if (active.party) {
            this.partyService.getPartyById(active.party as unknown as string).subscribe(p => {
              this.activePartyName.set(p.name);
            });
          }
        }
      });
    });
  }

  onCompleteQuest(): void {
    const quest = this.activeQuest();
    if (quest && confirm('Are you sure you want to end this quest? This action is permanent.')) {
      this.questService.completeQuest(quest._id).subscribe({
        next: () => {
          alert('Quest successfully completed!');
          this.activeQuest.set(null);
          this.activePartyName.set('Deployment Pending');
        },
        error: (err) => console.error('Failed to complete quest', err)
      });
    }
  }

  generateInitials(name: string | undefined): string {
    if (!name || name.trim() === '') return '??';
    if (name === 'You') return 'ME';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
  }
}

