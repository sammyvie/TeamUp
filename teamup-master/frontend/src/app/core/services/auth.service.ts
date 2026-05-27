import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError, throwError, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiError
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API       = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'teamup_token';
  private readonly USER_KEY  = 'teamup_user';

  // ─────────────────────────────────────────────────────────────────
  // 🔧 SIMULATION MODE — set to false when backend is ready
  // ─────────────────────────────────────────────────────────────────
  private readonly SIMULATION_MODE = false;

  // Simulated accounts for login testing
  private readonly MOCK_ACCOUNTS: Record<string, { password: string; role: User['role']; fullName: string }> = {
    'apprentice@teamup.com': { password: 'Test1234!',       role: 'apprentice',   fullName: 'John Apprentice'   },
    'master@teamup.com':     { password: 'Test1234!',       role: 'partyMaster',  fullName: 'Party Master Joe'  },
    'client@teamup.com':     { password: 'Test1234!',       role: 'commissioner', fullName: 'Jane Commissioner' },
    'admin@teamup.com':      { password: 'teamup-admin1234', role: 'admin',       fullName: 'Super Admin'       },
  };

  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  private readonly _token       = signal<string | null>(this.loadTokenFromStorage());

  readonly currentUser    = this._currentUser.asReadonly();
  readonly token          = this._token.asReadonly();
  readonly isLoggedIn     = computed(() => !!this._token() && !!this._currentUser());
  readonly userRole       = computed(() => this._currentUser()?.role ?? null);
  readonly isPartyMaster  = computed(() => this._currentUser()?.role === 'partyMaster');
  readonly isCommissioner = computed(() => this._currentUser()?.role === 'commissioner');
  readonly isApprentice   = computed(() => this._currentUser()?.role === 'apprentice');
  readonly isAdmin        = computed(() => this._currentUser()?.role === 'admin');

  // ─────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.SIMULATION_MODE) {
      return this.simulateLoginCall(credentials);
    }
    return this.http
      .post<AuthResponse>(`${this.API}/login`, credentials)
      .pipe(
        tap(res => this.handleAuthSuccess(res)),
        catchError(err => this.handleError(err))
      );
  }

  // ─────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────
  register(data: RegisterRequest): Observable<AuthResponse> {
    if (this.SIMULATION_MODE) {
      return this.simulateRegisterCall(data);
    }
    return this.http
      .post<AuthResponse>(`${this.API}/register`, data)
      .pipe(
        tap(res => this.handleAuthSuccess(res)),
        catchError(err => this.handleError(err))
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(['/login']);
  }


  // ─────────────────────────────────────────────────────────────────
  // SIMULATION HELPERS
  // ─────────────────────────────────────────────────────────────────
  private simulateLoginCall(credentials: LoginRequest): Observable<AuthResponse> {
    const account = this.MOCK_ACCOUNTS[credentials.email.toLowerCase()];

    if (!account || account.password !== credentials.password) {
      return throwError(() => ({
        message: 'Invalid email or password.'
      })).pipe(delay(600));
    }

    const mockResponse = this.buildMockResponse(account.role, account.fullName, credentials.email);
    this.handleAuthSuccess(mockResponse);
    return of(mockResponse).pipe(delay(600));
  }

  private simulateRegisterCall(data: RegisterRequest): Observable<AuthResponse> {
    const storedRole = localStorage.getItem('teamup_register_role') as User['role'] | null;
    const role: User['role'] = storedRole === 'commissioner' ? 'commissioner' : 'apprentice';
    localStorage.removeItem('teamup_register_role');

    const mockResponse = this.buildMockResponse(role, data.fullName, data.email);
    this.handleAuthSuccess(mockResponse);
    return of(mockResponse).pipe(delay(800));
  }

  private buildMockResponse(role: User['role'], fullName: string, email: string): AuthResponse {
    const user: User = {
      _id:      `mock-${Date.now()}`,
      fullName,
      email,
      role,
      level:    role === 'partyMaster' ? 12 : 1,
      exp:      role === 'partyMaster' ? 3200 : 0,
      professionalInfo: { primarySkills: [], techStack: [] },
      currentParty: null,
      createdAt: new Date().toISOString(),
    };
    return { user, token: `mock-token-${role}-${Date.now()}` };
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._currentUser.set(res.user);
  }

  private handleError(err: any): Observable<never> {
    const apiError: ApiError = err.error || { message: 'An unexpected error occurred' };
    return throwError(() => apiError);
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}