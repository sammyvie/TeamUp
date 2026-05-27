// Mirrors backend models/User.js exactly

export type UserRole = 'apprentice' | 'partyMaster' | 'commissioner' | 'admin';

export interface ProfessionalInfo {
  primarySkills: string[];
  techStack: string[];
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  level: number;
  exp: number;
  githubUsername?: string;
  phoneNum?: string;
  location?: string;
  professionalInfo: ProfessionalInfo;
  currentParty?: string | {_id: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

// Matches authController.js login() body
export interface LoginRequest {
  email: string;
  password: string;
}

// Matches authController.js register() body
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  githubUsername?: string;
  phoneNum?: string;
  location?: string;
  professionalInfo?: ProfessionalInfo;
}

// Matches what backend returns from both login() and register()
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  error?: string;
}