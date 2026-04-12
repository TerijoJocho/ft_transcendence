import { Test, TestingModule } from '@nestjs/testing';
import { DoubleFactorService } from './double_factor.service';

describe('DoubleFactorService', () => {
  let service: DoubleFactorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoubleFactorService],
    }).compile();

    service = module.get<DoubleFactorService>(DoubleFactorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
