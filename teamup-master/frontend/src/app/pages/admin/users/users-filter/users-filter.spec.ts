import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFilter } from './users-filter';

describe('UsersFilter', () => {
  let component: UsersFilter;
  let fixture: ComponentFixture<UsersFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
