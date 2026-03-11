import { Body, Controller, Param, Post } from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';

@injectable()
export class UserService{
    constructor(private readonly utils: UtilsService) {}

    @Post()
    deleteUser(userId: number) {
        return this.utils.deletePlayers(userId);
    }

    @Post()
    logoutUser(@Param(':id') userId: number) {
        //supp le token, ou le cookie 
        return { message: 'User logged out successfully' };
    }
}
