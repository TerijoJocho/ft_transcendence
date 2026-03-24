import { Controller, Delete, Res, Patch, Body, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateDto';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import type { Response } from 'express';

@Controller('users')
export class UsersController {

    constructor(private UserService: UserService) { }

    @Get('me')
    @UseGuards(PassportJwtGuard)
    getDataUser(@CurrentUser() user: { playerId: number })
    {
        const playerId = user.playerId;
        return this.UserService.getDataUser(playerId);
    }

    @UseGuards(PassportJwtGuard)
    @Delete('delete')
    deleteUser(@CurrentUser() user: { playerId: number }, @Res() response: Response ) 
    {
        const playerId = user.playerId;
        return this.UserService.deleteUserbyId(playerId, response);
    }

    @UseGuards(PassportJwtGuard)
    @Patch('update')
    updateData(@CurrentUser() user: { playerId: number }, @Body() Data: UpdateUserDto) 
    {
        const playerId = user.playerId;
        const result = this.UserService.updateUserData(playerId, Data);
        return { message: result.message };
    }
}