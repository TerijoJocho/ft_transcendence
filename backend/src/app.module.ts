import { Module } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigninModule } from './signin/signin.module';
import { SharedModule } from './shared/shared.module';

@Module({ 
imports: [SharedModule, SigninModule], 
controllers: [AppController], 
providers: [AppService], 
}) export class AppModule {}