import {
  Controller,
  Post,
  UseGuards,
  Body,
  ParseIntPipe,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { NewGameDto } from './dto/new-game.dto';
import { EndGameDto } from './dto/end-game.dto';
import { GameService } from './game.service';
import { LogoutDto } from 'src/auth/dto/logout.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  @UseGuards(PassportJwtGuard)
  create(@CurrentUser() user: LogoutDto, @Body() bodyDto: NewGameDto) {
    return this.gameService.generateNewGame(bodyDto, user.playerId);
  }

  @Post(':gameId/join')
  @UseGuards(PassportJwtGuard)
  join(
    @CurrentUser() user: LogoutDto,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.joinGame(gameId, user.playerId);
  }

  @Post(':gameId/end')
  @UseGuards(PassportJwtGuard)
  end(
    @CurrentUser() user: LogoutDto,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() bodyDto: EndGameDto,
  ) {
    return this.gameService.endGame(bodyDto, gameId, user.playerId);
  }

  @Post(':gameId/giveup')
  @UseGuards(PassportJwtGuard)
  giveup(
    @CurrentUser() user: LogoutDto,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.giveupGame(gameId, user.playerId);
  }

  @Get('pending')
  @UseGuards(PassportJwtGuard)
  pending(@CurrentUser() user: LogoutDto) {
    return this.gameService.listPendingGames(user.playerId);
  }

  @Get(':gameId/session')
  @UseGuards(PassportJwtGuard)
  session(
    @CurrentUser() user: LogoutDto,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.getSession(gameId, user.playerId);
  }

  @Delete(':gameId/cancel')
  @UseGuards(PassportJwtGuard)
  cancel(
    @CurrentUser() user: LogoutDto,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.cancelGame(gameId, user.playerId);
  }
}
