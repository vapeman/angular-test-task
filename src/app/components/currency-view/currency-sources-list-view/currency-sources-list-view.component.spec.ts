import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencySourcesListViewComponent } from './currency-sources-list-view.component';

describe('CurrencySourcesListViewComponent', () => {
  let component: CurrencySourcesListViewComponent;
  let fixture: ComponentFixture<CurrencySourcesListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrencySourcesListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencySourcesListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
