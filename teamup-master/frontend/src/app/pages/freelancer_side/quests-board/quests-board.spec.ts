import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestsBoard } from './quests-board';

describe('QuestsBoard', () => {
  let component: QuestsBoard;
  let fixture: ComponentFixture<QuestsBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestsBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestsBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
