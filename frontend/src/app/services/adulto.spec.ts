import { TestBed } from '@angular/core/testing';

import { Adulto } from './adulto';

describe('Adulto', () => {
  let service: Adulto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Adulto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
