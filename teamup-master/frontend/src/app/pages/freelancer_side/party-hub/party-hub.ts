import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { FreelancerBackground } from '../freelancer-background';
import { PartyService } from '../../../core/services/party.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-party-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, FreelancerBackground],
  templateUrl: './party-hub.html',
  styleUrl: './party-hub.css'
})
export class PartyHub implements OnInit {
  private partyService = inject(PartyService);
  private profileService = inject(ProfileService);

  parties = signal<any[]>([]);
  searchTerm = signal('');
  user = this.profileService.currentUser;

  filteredParties = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.parties().filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term) ||
      p.techStack?.some((t: string) => t.toLowerCase().includes(term))
    );
  });

  showCreateParty = false;
  newParty = { name: '', description: '', techStack: '' };

  ngOnInit(): void {
    this.loadParties();
  }

  loadParties(): void {
    this.partyService.getParties().subscribe({
      next: (data) => this.parties.set(data),
      error: (err) => console.error('Failed to load parties:', err)
    });
  }

  updateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }


  joinParty(partyId: string): void {
    if (this.user()?.currentParty) {
      alert("Contract Denied: You are already assigned to an active party.");
      return;
    }

    this.partyService.joinParty(partyId).subscribe({
      next: (res) => {
        alert("Success: You have joined the formation.");
        this.profileService.fetchProfile().subscribe();
        this.loadParties(); 
      },
      error: (err) => alert(err.error.message || "Failed to join party.")
    });
  }


  createParty(): void {
    if (this.user()?.currentParty) {
      alert("Deployment Locked: Dissolve your current party before creating a new one.");
      return;
    }

    if (this.newParty.name && this.newParty.description) {
      const partyData = {
        ...this.newParty,
        techStack: this.newParty.techStack.split(',').map(s => s.trim())
      };

      this.partyService.createParty(partyData).subscribe({
        next: () => {
          // 1. Sync profile to lock the "Create" button
          this.profileService.fetchProfile().subscribe();
          // 2. Refresh local list
          this.loadParties(); 
          this.showCreateParty = false;
          this.newParty = { name: '', description: '', techStack: '' };
        },
        error: (err) => alert(err.error.message || "Failed to launch party.")
      });
    }
  }
}