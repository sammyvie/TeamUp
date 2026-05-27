import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface DashboardStats {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalQuests: number;
  activeParties: number;
  questsInProgress: number;
  completedQuests: number;
}

export interface UserGrowthData {
  _id: { year: number; month: number; day: number };
  count: number;
}

export interface QuestStatusStat {
  _id: string; 
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  dashboardStats = signal<DashboardStats | null>(null);
  users = signal<User[]>([]); //
  adminQuests = signal<any[]>([]);


  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).pipe(
      tap(stats => {
        console.log('Admin Stats Fetched:', stats);
        this.dashboardStats.set(stats);
      })
    );
  }

  getUserGrowth(): Observable<UserGrowthData[]> {
    return this.http.get<UserGrowthData[]>(`${this.apiUrl}/user-growth`);
  }

  getQuestStatusStats(): Observable<QuestStatusStat[]> {
    return this.http.get<QuestStatusStat[]>(`${this.apiUrl}/quest-stats`);
  }

  getUsers(role: string = 'all', search: string = ''): Observable<User[]> {
    let params = new HttpParams().set('role', role).set('search', search);

    return this.http.get<User[]>(`${this.apiUrl}/users`, { params }).pipe(
      tap(data => this.users.set(data))
    );
  }

  getQuests(status: string = 'all', search: string = ''): Observable<any[]> {
    let params = new HttpParams().set('status', status).set('search', search);

    return this.http.get<any[]>(`${this.apiUrl}/quests`, { params }).pipe(
      tap(data => this.adminQuests.set(data))
    );
  }
}