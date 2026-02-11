import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './signin/signin.controller';
import { SigninModule } from './signin/signin.module';

@Module({
  imports: [SigninModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
