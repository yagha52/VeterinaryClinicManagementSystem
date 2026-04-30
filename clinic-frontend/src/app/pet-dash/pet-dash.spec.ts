import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetDash } from './pet-dash';

describe('PetDash', () => {
  let component: PetDash;
  let fixture: ComponentFixture<PetDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetDash],
    }).compileComponents();

    fixture = TestBed.createComponent(PetDash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
