import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adultos } from './adultos';

describe('Adultos', () => {
  let component: Adultos;
  let fixture: ComponentFixture<Adultos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adultos],
    }).compileComponents();

    fixture = TestBed.createComponent(Adultos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
