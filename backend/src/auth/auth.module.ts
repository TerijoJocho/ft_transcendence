import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SigninService } from './signin/signin.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [SigninService],
})
export class AuthModule { }
