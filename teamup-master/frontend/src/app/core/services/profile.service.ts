import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'teamup_user'; 

  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchProfile().subscribe();
    }
  }

  fetchProfile(): Observable<User | null> {
    return this.http.get<User>(`${this.API}/profile`).pipe(
      tap((user) => {
        console.log("✅ Profile synced with server:", user.role);
        this.updateLocalUser(user);
      }),
      catchError((err) => {
        console.error("❌ Profile sync failed:", err);
        return of(null);
      })
    );
  }
  
  private updateLocalUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this._currentUser.set(user);
  }

  private loadUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem(this.USER_KEY);
      try { 
        return user ? JSON.parse(user) : null; 
      } catch (e) { 
        return null; 
      }
    }
    return null;
  }
}