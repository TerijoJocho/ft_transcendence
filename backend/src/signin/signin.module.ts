import { Module } from '@nestjs/common';
import { SigninService } from './signin.service';
import { SigninController } from './signin.controller';

@Module({
  imports: [],
  controllers: [SigninController],
  providers: [SigninService],
})
export class SigninModule {}
