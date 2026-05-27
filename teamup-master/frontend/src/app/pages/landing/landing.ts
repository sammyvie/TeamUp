import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgFor, NgClass, UpperCasePipe } from '@angular/common';
import { LandingNav } from '../../components/landing-nav/landing-nav';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, NgFor, NgClass, LandingNav, UpperCasePipe],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  private readonly router = inject(Router);

  activeIndex = 0;

  goToRegister(): void { this.router.navigate(['/register']); }

  nextMission(): void {
    if (this.activeIndex < this.missions.length - 1) this.activeIndex++;
  }

  prevMission(): void {
    if (this.activeIndex > 0) this.activeIndex--;
  }

  setActive(i: number): void { this.activeIndex = i; }

  getXpPercent(xp: number, total: number): number {
    return Math.min(Math.round((xp / total) * 100), 100);
  }
tickerItems = [
  'QUEST ACTIVE', 'PROOF OF SKILL', 'ANGELES CITY',
  'BUILD THE FUTURE', 'LEVEL UP', 'JOIN THE PARTY',
  'TEAMUP NOW', '63% SKILLS GAP', 'CLARK FREEPORT',
];

ticker2 = [
  "DON'T QUEST ALONE",
  "DON'T QUEST ALONE",
  "DON'T QUEST ALONE",
  "DON'T QUEST ALONE",
  "DON'T QUEST ALONE",
  "DON'T QUEST ALONE",
];

  missions = [
    {
      img: 'https://i.postimg.cc/MfHkT5nJ/Cozy-Pixel-Art-Cafe-Scene-Autumn-Coffee-Shop-Aesthetic-with-Pastries-Warm-Lighting.jpg',
      tag: 'LOCAL BUSINESS',
      type: 'Web App',
      title: 'DIGITAL MENU FOR LOCAL CAFE',
      desc: 'Build a modern digital ordering system for a beloved local eatery in Clark Freeport Zone.',
      difficulty: 'easy',
      techStack: ['Angular', 'Node.js', 'MongoDB'],
      xp: 250,
      xpToRankUp: 500,
      currentRank: 'Apprentice',
      nextRank: 'Journeyman'
    },
    {
      img: 'https://i.postimg.cc/m1tqRrnN/Amy-s-Fantasies-PC-98.jpg',
      tag: 'REAL ESTATE',
      type: 'Full Stack',
      title: 'DIGITAL INNOVATION HUB',
      desc: 'Design and develop a property listing platform for the Clark Freeport Zone ecosystem.',
      difficulty: 'medium',
      techStack: ['React', 'Express', 'PostgreSQL'],
      xp: 500,
      xpToRankUp: 1000,
      currentRank: 'Journeyman',
      nextRank: 'Expert'
    },
    {
      img: 'https://i.postimg.cc/DWnM06NR/(22).jpg',
      tag: 'E-COMMERCE',
      type: 'Platform',
      title: 'E-COMMERCE PLATFORM LAUNCH',
      desc: 'Launch a full-stack marketplace connecting local artisans with global buyers.',
      difficulty: 'hard',
      techStack: ['Angular', 'Express', 'AWS', 'Redis'],
      xp: 1000,
      xpToRankUp: 2000,
      currentRank: 'Expert',
      nextRank: 'Party Master'
    },
    {
      img: 'https://i.postimg.cc/bYGW0k5b/PARTY-MASTER.png',
      tag: 'FINTECH',
      type: 'Mobile + Web',
      title: 'PAYMENT GATEWAY INTEGRATION',
      desc: 'Integrate a secure payment system for local SMEs across Angeles City and Clark.',
      difficulty: 'hard',
      techStack: ['Vue.js', 'Node.js', 'Stripe', 'Docker'],
      xp: 1200,
      xpToRankUp: 2000,
      currentRank: 'Expert',
      nextRank: 'Party Master'
    },
    {
      img: 'https://i.postimg.cc/m1tqRrnN/Amy-s-Fantasies-PC-98.jpg',
      tag: 'EDUCATION',
      type: 'LMS Platform',
      title: 'SKILLS TRAINING PORTAL',
      desc: 'Build a learning management system for local tech bootcamps and training centers.',
      difficulty: 'medium',
      techStack: ['Angular', 'NestJS', 'MySQL'],
      xp: 600,
      xpToRankUp: 1000,
      currentRank: 'Journeyman',
      nextRank: 'Expert'
    },
  ];

  roles = [
    {
      img: 'https://i.postimg.cc/mzcXRmZ8/Screenshot-2026-03-18-at-1-16-36-PM.png',
      name: 'THE PARTY MASTER',
      shortName: 'Party Master',
      stars: 5,
      rank: 'High-Level Professional (3000+ GitHub commits)',
      mission: 'Provide core project architecture and technical strategy. Lead the team.',
      quest: 'Mentor apprentices through real-world challenges using professional workflows.',
      loot: 'Earns leadership XP, project compensation, and community reputation.'
    },
    {
      img: 'https://i.postimg.cc/mzcXRmZ8/Screenshot-2026-03-18-at-1-16-36-PM.png',
      name: 'THE APPRENTICE',
      shortName: 'Apprentice',
      stars: 3,
      rank: 'Student / Junior Developer',
      mission: 'Learn industry tactics via real-world projects under a Party Master.',
      quest: 'Build a battle-verified portfolio while solving actual local business problems.',
      loot: 'Levels up technical skills, earns XP, builds a verified commit history.'
    },
    {
      img: 'https://i.postimg.cc/mzcXRmZ8/Screenshot-2026-03-18-at-1-16-36-PM.png',
      name: 'THE COMMISSIONER',
      shortName: 'Commissioner',
      stars: 4,
      rank: 'Local Business Owner / SME',
      mission: 'Provide real-world business challenges and project funding to the hub.',
      quest: 'Outsource IT needs to a high-trust, mentored developer team.',
      loot: 'Receives high-quality digital solutions while supporting local tech growth.'
    },
  ];

  getArr(n: number): number[] { return Array(n).fill(0); }
}