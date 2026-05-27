import { ClientBackground } from '../client-background';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Navbar } from '../../../components/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import { QuestService } from '../../../core/services/quest.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, ClientBackground],
  templateUrl: './client-profile.html',
  styleUrl: './client-profile.css'
})
export class ClientProfile implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly questService = inject(QuestService);

  // --- Core Data from ProfileService ---
  readonly user = this.profileService.currentUser;
  
  // Grabs the first name from the full name string
  readonly firstName = computed(() => {
    const name = this.user()?.fullName;
    return name ? name.split(' ') : 'Adventurer';
  });
  
  readonly memberSince = computed(() => {
    const date = this.user()?.createdAt;
    return date ? new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  });

  clientQuests = computed(() => {
    const userId = this.user()?._id;
    if (!userId) return [];
    
    return this.questService.quests().filter(q => {
      // Handle cases where commissioner might be a string or an object
      const commId = typeof q.commissioner === 'object' 
        ? q.commissioner._id 
        : q.commissioner;
      return commId === userId;
    });
  });

  liveStats = computed(() => {
    const q = this.clientQuests();
     
    // 1. Extract just the IDs of the parties involved in these quests
    const partyIds = q
      .map(x => {
        const p = x.party as any; // Cast as any to handle the populated object
        // If party is an object, get the _id; otherwise, use the value as is
        return typeof p === 'object' ? p?._id : p;
      })
      .filter(id => !!id); // Remove null/undefined values

    return {
      total: q.length,
      active: q.filter(x => x.status === 'open' || x.status === 'in_progress').length,
      completed: q.filter(x => x.status === 'completed').length,
      
      // 2. Use the Set on the Array of STRINGS (the IDs)
      activeParties: [...new Set(partyIds)].length 
    };
  });


  ngOnInit(): void {
    // 1. Fetch fresh profile data to populate the signal
    this.profileService.fetchProfile().subscribe();
    
    // 2. Fetch quests to populate the hub/stats signals
    this.questService.getQuests().subscribe();
  }

  // We still use AuthService for session termination
  logout(): void {
    this.authService.logout();
  }
}