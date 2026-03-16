import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PassportJwtRefreshGuard extends AuthGuard('jwt-refresh') {}
