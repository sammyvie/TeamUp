import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Landing } from './landing';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing]
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have missions', () => {
    expect(component.missions.length).toBe(3);
  });

  it('should have roles', () => {
    expect(component.roles.length).toBe(3);
  });
});