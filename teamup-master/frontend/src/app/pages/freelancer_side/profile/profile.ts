import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule} from '@angular/common';
import { Navbar } from '../../../components/navbar/navbar';
import { FreelancerBackground } from '../freelancer-background';
import { ProfileService } from '../../../core/services/profile.service';
import { PartyService } from '../../../core/services/party.service';

@Component({
  selector: 'app-freelancer-profile',
  standalone: true,
  imports: [CommonModule, Navbar, FreelancerBackground],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class FreelancerProfile implements OnInit {
  private profileService = inject(ProfileService);
  private partyService = inject(PartyService);

  user = this.profileService.currentUser;
  name = computed(() => this.user()?.fullName);
  role = computed(() => this.user()?.role);
  email = computed(() => this.user()?.email);
  phonenum = computed(() => this.user()?.phoneNum);
  location = computed(() => this.user()?.location);
  githubname = computed(() => this.user()?.githubUsername);

  memberSince = computed(() => {
    const date = this.user()?.createdAt;
    return date 
      ? new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
      : 'March 2026'; 
  });
  
  primaryskills = computed(() => this.user()?.professionalInfo?.primarySkills?.join(', ') || 'None');
  techstack = computed(() => this.user()?.professionalInfo?.techStack?.join(', ') || 'None');
  exp = computed(() => this.user()?.exp || 0);
  level = computed(() => this.user()?.level || 1);
  currentParty = signal<any>(null);

  ngOnInit(): void {
    this.profileService.fetchProfile().subscribe({
      next: (userData) => {
        const partyData = userData?.currentParty;
        const partyId = (typeof partyData === 'object') ? partyData?._id : partyData;

        if (partyId) {
          this.loadPartyDetails(partyId);
        }
      },
      error: (err) => console.error('Failed to load profile:', err)
    });
  }

  private loadPartyDetails(partyId: string): void {
    this.partyService.getPartyById(partyId).subscribe({
      next: (party) => this.currentParty.set(party),
      error: (err) => console.error('Failed to load party details:', err)
    });
  }
}