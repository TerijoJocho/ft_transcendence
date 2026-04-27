import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { UsersModule } from '../users/users.module';
import { DoubleFactorModule } from '../double_factor/double_factor.module';

@Module({
  imports: [PassportModule, JwtModule, DoubleFactorModule, UsersModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleAuthStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
