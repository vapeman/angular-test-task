import { TestBed } from '@angular/core/testing';

import { CbrJsonService } from './cbr-json.service';

describe('CbrJsonService', () => {
  let service: CbrJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CbrJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
