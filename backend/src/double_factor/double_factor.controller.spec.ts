import { Test, TestingModule } from '@nestjs/testing';
import { DoubleFactorController } from './double_factor.controller';
import { DoubleFactorService } from './double_factor.service';

describe('DoubleFactorController', () => {
  let controller: DoubleFactorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoubleFactorController],
      providers: [DoubleFactorService],
    }).compile();

    controller = module.get<DoubleFactorController>(DoubleFactorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
