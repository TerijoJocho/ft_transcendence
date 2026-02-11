import { Module } from '@nestjs/common';
import { AuthController } from './signin.controller';
import { SigninService } from './signin.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [SigninService],
})
export class SigninModule {}
