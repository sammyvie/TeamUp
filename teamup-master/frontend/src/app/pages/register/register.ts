import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(g: AbstractControl) {
  return g.get('password')?.value === g.get('confirmPassword')?.value
    ? null : { passwordMismatch: true };
}

export const PRIMARY_SKILLS = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Backend Development', 'Frontend Development', 'Full Stack Development',
  'Game Development', 'Data Science', 'Machine Learning', 'DevOps',
  'Cybersecurity', 'Cloud Computing', 'QA / Testing', 'Technical Writing',
] as const;

export const TECH_GROUPS = [
  { label: 'Frontend',     items: ['HTML','CSS','JavaScript','TypeScript','Angular','React','Vue','Next.js'] },
  { label: 'Backend',      items: ['Node.js','Express.js','Django','Flask','Laravel','Spring Boot'] },
  { label: 'Databases',    items: ['MongoDB','MySQL','PostgreSQL','Firebase'] },
  { label: 'DevOps/Tools', items: ['Docker','Kubernetes','Git','GitHub Actions'] },
  { label: 'Cloud',        items: ['AWS','Azure','Google Cloud'] },
  { label: 'Mobile',       items: ['Flutter','React Native','Swift','Kotlin'] },
] as const;

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  selectedRole = signal<'freelancer' | 'commissioner' | null>(null);

  showPass    = signal(false);
  showConfirm = signal(false);
  isLoading   = signal(false);
  apiError    = signal('');
  termsError  = signal(false);
  step        = signal(1);

  primarySkills = signal<string[]>([]);
  techStack     = signal<string[]>([]);
  skillDropOpen = signal(false);
  techDropOpen  = signal(false);
  skillSearch   = signal('');

  readonly skillOptions = PRIMARY_SKILLS;
  readonly techGroups   = TECH_GROUPS;

  form = this.fb.group({
    fullName:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['',  Validators.required],
    githubUsername:  [''],
    phoneNum:        [''],
    location:        [''],
    agreeTerms:      [false]
  }, { validators: passwordMatchValidator });

  private readonly passwordValue = toSignal(this.form.get('password')!.valueChanges,        { initialValue: '' });
  private readonly confirmValue  = toSignal(this.form.get('confirmPassword')!.valueChanges, { initialValue: '' });
  private readonly fullNameValue = toSignal(this.form.get('fullName')!.valueChanges,        { initialValue: '' });
  private readonly emailValue    = toSignal(this.form.get('email')!.valueChanges,           { initialValue: '' });

  readonly pwReqs = computed(() => {
    const p: string = this.passwordValue() ?? '';
    return {
      minLength:  p.length >= 8,
      hasUpper:   /[A-Z]/.test(p),
      hasLower:   /[a-z]/.test(p),
      hasNumber:  /[0-9]/.test(p),
      hasSpecial: /[^A-Za-z0-9]/.test(p),
    };
  });

  readonly allReqsMet = computed(() => Object.values(this.pwReqs()).every(Boolean));

  readonly step1Valid = computed(() => {
    const fullName = this.fullNameValue() ?? '';
    const email    = this.emailValue() ?? '';
    const pass     = this.passwordValue() ?? '';
    const confirm  = this.confirmValue() ?? '';
    return (
      fullName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      this.allReqsMet() &&
      pass === confirm && confirm.length > 0
    );
  });

  readonly filteredSkills = computed(() => {
    const q = this.skillSearch().toLowerCase();
    return q ? PRIMARY_SKILLS.filter(s => s.toLowerCase().includes(q)) : [...PRIMARY_SKILLS];
  });

  get isFreelancer()   { return this.selectedRole() === 'freelancer'; }
  get isCommissioner() { return this.selectedRole() === 'commissioner'; }

  selectRole(role: 'freelancer' | 'commissioner'): void {
    this.selectedRole.set(role);
    this.step.set(1);
    localStorage.setItem('teamup_register_role', role === 'commissioner' ? 'commissioner' : 'apprentice');
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['email'])     return 'Please enter a valid email.';
    if (c.errors['minlength']) return `Must be at least ${c.errors['minlength'].requiredLength} characters.`;
    return 'Invalid input.';
  }

  nextStep(): void {
    if (!this.step1Valid()) {
      ['fullName','email','password','confirmPassword'].forEach(f => this.form.get(f)?.markAsTouched());
      return;
    }
    this.step.set(2);
  }

  toggleSkill(skill: string): void {
    this.primarySkills.update(arr => arr.includes(skill) ? arr.filter(s => s !== skill) : [...arr, skill]);
  }
  removeSkill(s: string): void { this.primarySkills.update(arr => arr.filter(x => x !== s)); }
  onSkillBlur(): void { setTimeout(() => this.skillDropOpen.set(false), 150); }

  toggleTech(tech: string): void {
    this.techStack.update(arr => arr.includes(tech) ? arr.filter(t => t !== tech) : [...arr, tech]);
  }
  removeTech(t: string): void { this.techStack.update(arr => arr.filter(x => x !== t)); }
  onTechBlur(): void { setTimeout(() => this.techDropOpen.set(false), 150); }

  onSubmit(): void {
    if (!this.form.get('agreeTerms')?.value) { this.termsError.set(true); return; }
    this.termsError.set(false);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.apiError.set('');

    const { fullName, email, password, githubUsername, phoneNum, location } = this.form.value;

    // ✨ FIXED: Added role parameter right here into the outbound bundle!
    const payload: any = {
      fullName: fullName!, 
      email: email!, 
      password: password!,
      role: this.selectedRole(), 
      ...(githubUsername && { githubUsername }),
      ...(phoneNum       && { phoneNum }),
      ...(location       && { location }),
    };

    if (this.isFreelancer) {
      payload.professionalInfo = {
        primarySkills: this.primarySkills(),
        techStack:     this.techStack(),
      };
    }

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.redirectByRole(res.user.role);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.apiError.set(err.message ?? 'Registration failed.');
      }
    });
  }

  // ✨ FIXED: Added toLowerCase() fallback tracking so redirects never misfire
  private redirectByRole(role: string): void {
    switch (role?.toLowerCase()) {
      case 'commissioner': this.router.navigate(['/client']);          break;
      case 'partymaster':  this.router.navigate(['/freelancer']);      break;
      case 'apprentice':   this.router.navigate(['/freelancer']);      break;
      case 'admin':        this.router.navigate(['/admin/dashboard']); break;
      default:             this.router.navigate(['/dashboard']);
    }
  }
}