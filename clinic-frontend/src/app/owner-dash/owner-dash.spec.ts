import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerDash } from './owner-dash';

describe('OwnerDash', () => {
  let component: OwnerDash;
  let fixture: ComponentFixture<OwnerDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDash],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
