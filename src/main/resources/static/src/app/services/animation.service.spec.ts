import { TestBed } from '@angular/core/testing';

import { animationService } from './animation.service';

describe('AnimationService', () => {
  let service: animationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(animationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
