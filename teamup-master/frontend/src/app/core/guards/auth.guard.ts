import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

// ─────────────────────────────────────────────────────────────────
// 🔧 TEMP: Always redirects to /client for testing
// When backend is ready, restore the role-based redirect:
//
//   const role = auth.userRole();
//   if (role === 'commissioner')     router.navigate(['/client']);
//   else if (role === 'partyMaster') router.navigate(['/freelancer']);
//   else if (role === 'admin')       router.navigate(['/admin']);
//   else                             router.navigate(['/dashboard']);
// ─────────────────────────────────────────────────────────────────
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  router.navigate(['/client']);
  return false;
};

export const partyMasterGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isPartyMaster()) return true;
  router.navigate(['/dashboard']);
  return false;
};

export const commissionerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isCommissioner()) return true;
  router.navigate(['/dashboard']);
  return false;
};