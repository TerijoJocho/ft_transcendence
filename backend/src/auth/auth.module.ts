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
import { UsersModule } from '../users/users.module';
import { DoubleFactorModule } from 'src/double_factor/double_factor.module';

@Module({
<<<<<<< HEAD
  imports: [PassportModule, JwtModule, DoubleFactorModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, GoogleAuthStrategy],
  controllers: [AuthController],
=======
  imports: [PassportModule, JwtModule, UsersModule, DoubleFactorModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleAuthStrategy,
  ],
>>>>>>> a43accd (feat(2FA): ajout methode 2FA pour le login)
})
export class AuthModule {}
