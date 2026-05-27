import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestTable } from './quest-table';

describe('QuestTable', () => {
  let component: QuestTable;
  let fixture: ComponentFixture<QuestTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
