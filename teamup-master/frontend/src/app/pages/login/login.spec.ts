import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form on init', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate email field', () => {
    component.form.get('email')?.setValue('not-an-email');
    expect(component.form.get('email')?.valid).toBeFalse();
  });

  it('should validate password min length', () => {
    component.form.get('password')?.setValue('123');
    expect(component.form.get('password')?.valid).toBeFalse();
  });
});