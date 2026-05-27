import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyHub } from './party-hub';

describe('PartyHub', () => {
  let component: PartyHub;
  let fixture: ComponentFixture<PartyHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
