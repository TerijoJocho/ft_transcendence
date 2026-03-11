import { UtilsService } from '../../shared/services/utils.func.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReadService {
  constructor(private readonly utils: UtilsService) {}
}
