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
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAllForUser(req.user.uid);
  }
  
  @Post()
  create(@Body() data: { userId: string; title: string; body: string; type: string; relatedId?: string }) {
    return this.notificationsService.createNotification(data);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Post('send')
  send(@Body() fieldsData: { title: string; body: string; Tokens: string[] }) {
    return this.notificationsService.sendMessage(fieldsData);
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.uid);
  }
}
