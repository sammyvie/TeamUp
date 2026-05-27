import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestFilter } from './quest-filter';

describe('QuestFilter', () => {
  let component: QuestFilter;
  let fixture: ComponentFixture<QuestFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
