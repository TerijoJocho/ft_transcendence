import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DoubleFactorService } from './double_factor.service';
import { CreateDoubleFactorDto } from './dto/create-double_factor.dto';
import { UpdateDoubleFactorDto } from './dto/UpdateDoubleFactorDto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { deleteDoubleFactorDto } from './dto/deleteDoubleFactorDto';

@Controller('2FA')
export class DoubleFactorController {
  constructor(private readonly doubleFactorService: DoubleFactorService) {}

  @Post('generate')
  @UseGuards(PassportJwtGuard)
  generate(@CurrentUser() user: { playerId: number }) {
    return this.doubleFactorService.setup2fa(user.playerId);
  }

  // @Get()
  // findAll() {
  //   return this.doubleFactorService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.doubleFactorService.findOne(+id);
  // }

  @Patch('active')
  @UseGuards(PassportJwtGuard)
  update(
    @CurrentUser() user: { playerId: number },
    @Body() data: { reply_code: string },
  ) {
    return this.doubleFactorService.active2fa(
      { userId: user.playerId },
      data.reply_code,
    );
  }

  @Delete('delete')
  @UseGuards(PassportJwtGuard)
  remove(
    @CurrentUser() user: { playerId: number },
    @Body() data: deleteDoubleFactorDto,
  ) {
    return this.doubleFactorService.remove(user.playerId, data);
  }
}
