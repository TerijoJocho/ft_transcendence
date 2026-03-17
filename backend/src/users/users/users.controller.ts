import { Controller, Delete, Param, ParseIntPipe, Patch, Body } from '@nestjs/common';
import { UserService } from '../userService/user.service';
import { UpdateUserDto } from '../updateDto';

@Controller('users')
export class UsersController {

    constructor(private UserService: UserService) {}

    @Delete('delete/:id') // penser a verifier que c'est bien le user qui veut supprimer son compte
    deleteUser(@Param('id', ParseIntPipe) playerId: number)
    {
        const result = this.UserService.deleteUserbyId(playerId);
        return { message: result.message };
    }

    @Patch('/:id')
    updateData(@Param('id', ParseIntPipe) userId: number, @Body() Data: UpdateUserDto)
    {
        const result = this.UserService.updateUserData(userId, Data);
        return { message: result.message };
    }
}