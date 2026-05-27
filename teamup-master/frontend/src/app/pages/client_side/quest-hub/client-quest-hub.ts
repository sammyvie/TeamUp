import { ClientBackground } from '../client-background';
import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { QuestService, Quest } from '../../../core/services/quest.service';
import { PartyService } from '../../../core/services/party.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-client-quest-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, ClientBackground],
  templateUrl: './client-quest-hub.html',
  styleUrl: './client-quest-hub.css'
})
export class ClientQuestHub implements OnInit {
  private questService = inject(QuestService);
  private partyService = inject(PartyService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // --- Identity Logic ---
  readonly currentUser = this.authService.currentUser;

  // --- Data Filtering (The fix for account switching) ---
  readonly myQuests = computed(() => {
    const userId = this.currentUser()?._id;
    if (!userId) return [];
    
    // Filter the global service signal to only show quests belonging to this user
    return this.questService.quests().filter(q => 
      q.commissioner === userId || q.commissioner?._id === userId
    );
  });

  readonly hasActiveQuest = computed(() => {
    return this.myQuests().some(q => q.status === 'open' || q.status === 'in_progress');
  });

  // --- UI State ---
  partyNames = signal<Record<string, string>>({});
  activeTab = signal('all');
  searchTerm = signal('');
  showCreateModal = signal(false); 
  questForm: FormGroup;
  isEditMode = signal(false);
  selectedQuest = signal<Quest | null>(null);

  constructor() {
    this.questForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      techStack: ['', [Validators.required]],
      deadline: ['', [Validators.required]],
      githubRepoOwner: ['', [Validators.required]],
      githubRepoName: ['', [Validators.required]]
    });

    // Effect to fetch party names only for relevant quests
    effect(() => {
      const quests = this.myQuests();
      const uniquePartyIds = [...new Set(quests.map(q => q.party).filter(id => !!id))] as string[];
      const currentMap = this.partyNames();
      const missingIds = uniquePartyIds.filter(id => !currentMap[id]);

      if (missingIds.length > 0) {
        const requests = missingIds.map(id => 
          this.partyService.getPartyById(id).pipe(
            catchError(() => of({ _id: id, name: 'Unknown Party' }))
          )
        );

        forkJoin(requests).subscribe(parties => {
          this.partyNames.update(map => {
            const newMap = { ...map };
            parties.forEach(p => { if (p) newMap[p._id] = p.name; });
            return newMap;
          });
        });
      }
    });
  }

  ngOnInit(): void {
    // Refresh global list from server
    this.questService.getQuests().subscribe();
  }

  // --- Modal Logic ---
  openCreateModal() {
    if (this.hasActiveQuest()) {
      alert("System Lock: Active objective detected. Complete it to unlock deployment.");
      return;
    }
    this.resetFormState(false);
    this.showCreateModal.set(true);
  }

  openViewModal(quest: Quest) {
    this.populateForm(quest, false);
    this.questForm.disable(); 
    this.showCreateModal.set(true);
  }

  openEditModal(quest: Quest) {
    this.populateForm(quest, true);
    this.questForm.enable(); 
    this.showCreateModal.set(true);
  }

  private resetFormState(editMode: boolean) {
    this.isEditMode.set(editMode);
    this.selectedQuest.set(null);
    this.questForm.enable();
    this.questForm.reset();
  }

  private populateForm(quest: Quest, editMode: boolean) {
    this.isEditMode.set(editMode);
    this.selectedQuest.set(quest);
    this.questForm.patchValue({
      title: quest.title,
      description: quest.description,
      techStack: quest.techStack.join(', '),
      deadline: quest.deadline ? new Date(quest.deadline).toISOString().split('T') : '',
      githubRepoOwner: quest.githubRepo.owner,
      githubRepoName: quest.githubRepo.name
    });
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.resetFormState(false);
  }

  submitQuest() {
    if (this.questForm.valid) {
      const val = this.questForm.value;
      const payload = {
        title: val.title,
        description: val.description,
        techStack: val.techStack.split(',').map((s: string) => s.trim()),
        deadline: val.deadline,
        githubRepoOwner: val.githubRepoOwner,
        githubRepoName: val.githubRepoName
      };

      const request = (this.isEditMode() && this.selectedQuest())
        ? this.questService.updateQuest(this.selectedQuest()!._id, payload)
        : this.questService.createQuest({ ...payload, status: 'open' });

      request.subscribe({
        next: () => this.closeCreateModal(),
        error: (err) => alert("Operation failed: " + err.error.message)
      });
    }
  }

  // --- Computed Stats & Filtering ---
  stats = computed(() => {
    const q = this.myQuests();
    return [
      { label: 'Total Quests', value: q.length.toString(), icon: 'grid' },
      { label: 'In Progress',  value: q.filter(x => x.status === 'in_progress').length.toString(), icon: 'clock' },
      { label: 'Completed',    value: q.filter(x => x.status === 'completed').length.toString(), icon: 'check' },
      { label: 'Open',         value: q.filter(x => x.status === 'open').length.toString(), icon: 'unlock' },
    ];
  });

  filteredQuests = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const tab = this.activeTab();
    
    return this.myQuests().filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(term) || 
                            q.description.toLowerCase().includes(term);
      
      const matchesTab = tab === 'all' || q.status === (tab === 'progress' ? 'in_progress' : tab);

      return matchesSearch && matchesTab;
    });
  });

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }
}