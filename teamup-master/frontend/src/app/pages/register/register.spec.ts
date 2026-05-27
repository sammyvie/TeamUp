import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on step 1', () => {
    expect(component.step()).toBe(1);
  });

  it('should detect password mismatch', () => {
    component.form.get('password')?.setValue('Password123!');
    component.form.get('confirmPassword')?.setValue('different');
    expect(component.form.errors?.['passwordMismatch']).toBeTrue();
  });

  it('should calculate password strength', () => {
    component.form.get('password')?.setValue('Password123!');
    expect(component.strengthPct()).toBeGreaterThan(50);
  });
});