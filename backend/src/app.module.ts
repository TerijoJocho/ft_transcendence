import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { SigninModule } from './signin/signin.module';

@Module({ 
imports: [SharedModule, AuthModule, SigninModule], 
controllers: [AppController], 
providers: [AppService], 
}) export class AppModule {}