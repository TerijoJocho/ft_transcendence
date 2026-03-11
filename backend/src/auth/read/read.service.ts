import { UtilsService } from '../../shared/services/utils.func.service';
import { Injectable } from '@nestjs/common';
import { player, playerTable } from '../../shared/db/schema';

@Injectable()
export class ReadService {
    constructor(private readonly utils: UtilsService) {}

    
}