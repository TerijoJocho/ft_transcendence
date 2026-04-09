import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { DoubleFactorModule } from 'src/double_factor/double_factor.module';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';

@Module({
  imports: [PassportModule, JwtModule, DoubleFactorModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, GoogleAuthStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
