import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { FreelancerBackground } from '../freelancer-background';
import { QuestService, Quest } from '../../../core/services/quest.service';
import { ProfileService } from '../../../core/services/profile.service';
import { PartyService } from '../../../core/services/party.service';

@Component({
  selector: 'app-freelancer-quests',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, FreelancerBackground],
  templateUrl: './quests.html',
  styleUrl: './quests.css'
})
export class FreelancerQuests implements OnInit {
  private questService = inject(QuestService);
  private profileService = inject(ProfileService);
  private partyService = inject(PartyService);

  searchTerm = signal('');
  selectedSkill = signal('');
  selectedDifficulty = signal('');
  
  user = this.profileService.currentUser;
  userParty = signal<any>(null); 
  allQuests = this.questService.quests; 

  canAcceptQuest = computed(() => {
    const u = this.user();
    const p = this.userParty();
    
    const isMaster = u?.role === 'partyMaster';
    const hasParty = !!u?.currentParty;
    const isPartyIdle = p && !p.activeQuest;

    return isMaster && hasParty && isPartyIdle;
  });

  filteredQuests = computed(() => {
    return this.allQuests().filter(q => {
      const search = this.searchTerm().toLowerCase();
      
      const commissionerName = (typeof q.commissioner === 'object') ? q.commissioner.fullName : 'Guild Client';
      const matchesSearch = q.title.toLowerCase().includes(search) || 
                            commissionerName?.toLowerCase().includes(search);
      
      const matchesSkill = !this.selectedSkill() || 
                           q.techStack.some(s => s.toLowerCase().includes(this.selectedSkill().toLowerCase()));
      
      const matchesDifficulty = !this.selectedDifficulty() || 
                                this.getDifficulty(q) === this.selectedDifficulty();

      return matchesSearch && matchesSkill && matchesDifficulty && q.status === 'open';
    });
  });

  recommendedQuests = computed(() => this.filteredQuests().slice(0, 3));

  ngOnInit(): void {
    this.refreshData();
  }


  refreshData(): void {
    this.questService.getQuests().subscribe();

    const currentParty = this.user()?.currentParty;
    const partyId = (typeof currentParty === 'object') ? currentParty?._id : currentParty;

    if (partyId) {
      this.partyService.getPartyById(partyId).subscribe({
        next: (party) => this.userParty.set(party),
        error: (err) => console.error('Failed to fetch party context:', err)
      });
    }
  }

  acceptQuest(questId: string): void {
    if (!this.canAcceptQuest()) {
      alert("Unauthorized: Only Party Masters with an idle party can accept quests.");
      return;
    }

    const currentParty = this.user()?.currentParty;
    const partyId = (typeof currentParty === 'object') ? currentParty?._id : currentParty;
    
    if (!partyId) {
      alert("System Error: Active Party ID not detected.");
      return;
    }

    this.partyService.acceptQuest(partyId, questId).subscribe({
      next: (res) => {
        alert("Quest Secured! The mission is now active for your party.");
        this.refreshData();
      },
      error: (err) => {
        alert(err.error?.message || "Critical Error: Failed to link quest to party records.");
      }
    });
  }

  private getDifficulty(quest: Quest): string {
    if (quest.techStack.length > 5) return 'Hard';
    if (quest.techStack.length > 2) return 'Medium';
    return 'Easy';
  }

  onSearchChange(value: string) { this.searchTerm.set(value); }
  onSkillChange(value: string) { this.selectedSkill.set(value); }
  onDifficultyChange(value: string) { this.selectedDifficulty.set(value); }
}