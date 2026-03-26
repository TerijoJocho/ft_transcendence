import { Controller, Post, UseGuards, Body, ParseIntPipe, Param, Delete } from '@nestjs/common';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { NewGameDto } from './dto/new-game.dto';
import { EndGameDto } from './dto/end-game.dto';
import { GameService } from './game.service';
import { LogoutDto } from 'src/auth/dto/logout.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Post('create')
  @UseGuards(PassportJwtGuard)
  create( 
	@CurrentUser() user: LogoutDto,
	@Body() bodyDto: NewGameDto) {
	return this.GameService.generateNewGame(bodyDto, user.playerId);
  }

  @Post(':gameId/join')
  @UseGuards(PassportJwtGuard)
  join(
	@CurrentUser() user: LogoutDto,
	@Param('gameId', ParseIntPipe) gameId: number) {
	return this.GameService.joinGame(gameId, user.playerId);
  }

  @Post(':gameId/end')
  @UseGuards(PassportJwtGuard)
  end(
	@Param('gameId', ParseIntPipe) gameId: number,
	@Body() bodyDto: EndGameDto) {
	return this.GameService.endGame(bodyDto, gameId);
  }

  @Post(':gameId/giveup')
  @UseGuards(PassportJwtGuard)
  giveup(
	@CurrentUser() user: LogoutDto,
	@Param('gameId', ParseIntPipe) gameId: number) {
	return this.GameService.giveupGame(gameId, user.playerId);
  }

  @Delete(':gameId/cancel')
  @UseGuards(PassportJwtGuard)
  cancel(
	@CurrentUser() user: LogoutDto,
	@Param('gameId', ParseIntPipe) gameId: number) {
	return this.GameService.cancelGame(gameId, user.playerId);
  }
}
