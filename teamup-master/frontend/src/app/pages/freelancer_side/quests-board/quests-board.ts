import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { FreelancerBackground } from '../freelancer-background';
import { TaskService, Task } from '../../../core/services/task.service';
import { ProfileService } from '../../../core/services/profile.service';
import { PartyService } from '../../../core/services/party.service';
import { QuestService, Quest } from '../../../core/services/quest.service';

export interface Member {
  name: string;
  initials: string;
  role: string;
}

@Component({
  selector: 'app-quests-board',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, FreelancerBackground],
  templateUrl: './quests-board.html',
  styleUrl: './quests-board.css'
})
export class QuestsBoard implements OnInit {
  private taskService = inject(TaskService);
  private profileService = inject(ProfileService);
  private partyService = inject(PartyService);
  private questService = inject(QuestService);

  ngOnInit(): void {
    this.taskService.clearTasks();
    this.currentQuest.set(null);
  }

  activeTab = 'tasks';
  showAddTask = false;
  editingTaskId: string | null = null;
  newTaskData = { name: '', description: '' };
  
  user = this.profileService.currentUser;
  partyData = this.partyService.currentParty;
  tasks = this.taskService.currentQuestTasks;
  currentQuest = signal<Quest | null>(null);

  activeQuestId = computed(() => {
    const q = this.currentQuest();
    if (!q) return null;
    return typeof q === 'string' ? q : q._id;
  });

  isPartyMaster = computed(() => this.user()?.role === 'partyMaster');

  members = computed<Member[]>(() => {
    const party = this.partyData();
    if (!party) return [];
    const list: Member[] = [];

    if (party.partyMaster) {
      list.push({
        name: party.partyMaster.fullName,
        initials: this.generateInitials(party.partyMaster.fullName),
        role: 'Party Master'
      });
    }

    party.apprentices?.forEach((app: any) => {
      list.push({
        name: app.fullName,
        initials: this.generateInitials(app.fullName),
        role: 'Apprentice'
      });
    });
    return list;
  });

  constructor() {
    effect(() => {
      const user = this.user();
      const userParty = user?.currentParty;
      const partyId = typeof userParty === 'object' ? userParty?._id : userParty;

      if (!partyId) {
        this.taskService.clearTasks();
        this.currentQuest.set(null);
        return; 
      }

      this.partyService.fetchPartyDetails(partyId).subscribe(party => {
        this.questService.getQuestsByParty(partyId).subscribe(quests => {
          const active = quests.find(q => q.status === 'in_progress');
          if (active) {
            this.currentQuest.set(active);
            this.taskService.getTasksByQuest(active._id).subscribe();
          } else {
            this.currentQuest.set(null);
            this.taskService.clearTasks();
          }
        });
      });
    }, { allowSignalWrites: true });
  }

  saveTask(): void {
    const qId = this.activeQuestId();
    if (!this.newTaskData.name || !qId) return;

    const request = this.editingTaskId 
      ? this.taskService.updateTask(this.editingTaskId, this.newTaskData)
      : this.taskService.createTask(qId, this.newTaskData);

    request.subscribe({
      next: () => this.closeModal(),
      error: (err) => alert(err.error?.message || "Sync failed.")
    });
  }

  toggleTaskStatus(task: Task): void {
    if (!this.isPartyMaster()) return; 
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    this.taskService.updateTask(task._id, { status: newStatus }).subscribe();
  }

  deleteTask(taskId: string): void {
    if (!this.isPartyMaster()) return;
    if (confirm('Permanently remove this objective from the board?')) {
      this.taskService.deleteTask(taskId).subscribe();
    }
  }

  openEditModal(task: Task) {
    if (!this.isPartyMaster()) return;
    this.editingTaskId = task._id;
    this.newTaskData = { name: task.name, description: task.description };
    this.showAddTask = true;
  }

  closeModal() {
    this.showAddTask = false;
    this.editingTaskId = null;
    this.newTaskData = { name: '', description: '' };
  }

  private generateInitials(name: string): string {
    return (name || '').split(' ').map(n => n).join('').toUpperCase().slice(0, 2);
  }
}