import { IsIn, IsNotEmpty } from 'class-validator';

export class NewGameDto {
	@IsNotEmpty()
	@IsIn(['BLACK', 'WHITE'])
	readonly playerColor: string;

	@IsIn(['CLASSIC', 'BLITZ', 'BULLET'])
	readonly gameMode?: string;
}