import { TestBed } from '@angular/core/testing';

import { CertificateServiceService } from './certificate-service.service';

describe('CertificateServiceService', () => {
  let service: CertificateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertificateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
