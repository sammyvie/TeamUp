import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── PUBLIC ──────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },

  // ── ADMIN LOGIN ─────────────────────────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/login/admin-login/admin-login').then(m => m.AdminLogin)
  },

  // ── PLACEHOLDER DASHBOARD ────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },

  // ── CLIENT (commissioner) ────────────────────────────────────────
  {
    path: 'client',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/client_side/overview/client-overview').then(m => m.ClientOverview)
  },
  {
    path: 'client/profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/client_side/profile/client-profile').then(m => m.ClientProfile)
  },
  {
    path: 'client/quest-hub',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/client_side/quest-hub/client-quest-hub').then(m => m.ClientQuestHub)
  },
  {
    path: 'client/quest-board',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/client_side/quest-board/client-quest-board').then(m => m.ClientQuestBoard)
  },

  // ── FREELANCER ───────────────────────────────────────────────────
  {
    path: 'freelancer',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/freelancer_side/dashboard/dashboard').then(m => m.FreelancerDashboard)
  },
  {
    path: 'freelancer/profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/freelancer_side/profile/profile').then(m => m.FreelancerProfile)
  },
  {
    path: 'freelancer/party-hub',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/freelancer_side/party-hub/party-hub').then(m => m.PartyHub)
  },
  {
    path: 'freelancer/quests',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/freelancer_side/quests/quests').then(m => m.FreelancerQuests)
  },
  {
    path: 'freelancer/quests-board',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/freelancer_side/quests-board/quests-board').then(m => m.QuestsBoard)
  },

  // ── ADMIN ────────────────────────────────────────────────────────
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/users/admin-users').then(m => m.AdminUsers)
  },
  {
    path: 'admin/quest',
    loadComponent: () => import('./pages/admin/quest/admin-quest').then(m => m.AdminQuest)
  },
  {
    path: 'admin/chat-logs',
    loadComponent: () => import('./pages/admin/chat-logs/admin-chat-logs').then(m => m.AdminChatLogs)
  },

  // ── FALLBACK ─────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];