import { Module } from '@nestjs/common';
import { DoubleFactorService } from './double_factor.service';
import { DoubleFactorController } from './double_factor.controller';

@Module({
  controllers: [DoubleFactorController],
  providers: [DoubleFactorService],
  exports: [DoubleFactorService],
})
export class DoubleFactorModule {}
