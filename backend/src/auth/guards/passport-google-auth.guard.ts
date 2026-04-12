import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class PassportGoogleAuthGuard extends AuthGuard('google') {
  private getAccessDeniedRedirectUrl(): string {
    const baseUrl =
      process.env.BASE_URL ??
      'https://localhost';
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'access_denied');
    return loginUrl.toString();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    if (request.query?.error === 'access_denied') {
      response.redirect(this.getAccessDeniedRedirectUrl());
      return false;
    }
  }
}
