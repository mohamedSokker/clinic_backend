import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(AuthGuard)
  async syncProfile(@Req() req: any, @Body() profileData: any) {
    const uid = req.user.uid;
    const email = req.user.email;
    try {
      return await this.usersService.update(uid, profileData);
    } catch (e) {
      return await this.usersService.create({ ...profileData, uid, email });
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    return this.usersService.findByUid(req.user.uid);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.usersService.update(req.user.uid, updateData);
  }
}
