import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DoubleFactorService } from './double_factor.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { deleteDoubleFactorDto } from './dto/deleteDoubleFactorDto';
import { LogoutDto } from 'src/auth/dto/logout.dto';
import { replyDoubleFactorDto } from './dto/replyDoubleFactorDto';

@Controller('2FA')
export class DoubleFactorController {
  constructor(private readonly doubleFactorService: DoubleFactorService) {}

  @Post('generate')
  @UseGuards(PassportJwtGuard)
  generate(@CurrentUser() user: { playerId: number }) {
    return this.doubleFactorService.setup2fa(user.playerId);
  }

  @Patch('active')
  @UseGuards(PassportJwtGuard)
  update(@CurrentUser() user: LogoutDto, @Body() data: replyDoubleFactorDto) {
    return this.doubleFactorService.active2fa(
      { userId: user.playerId },
      data.reply_code,
    );
  }

  @Delete('delete')
  @UseGuards(PassportJwtGuard)
  remove(@CurrentUser() user: LogoutDto, @Body() data: deleteDoubleFactorDto) {
    return this.doubleFactorService.remove(user.playerId, data);
  }
}
