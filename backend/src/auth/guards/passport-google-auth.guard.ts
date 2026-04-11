import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class PassportGoogleAuthGuard extends AuthGuard('google') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		if (request.query?.error === 'access_denied') {
			response.redirect('https://localhost/login');
			return false;
		}

		return (await super.canActivate(context)) as boolean;
	}
}
