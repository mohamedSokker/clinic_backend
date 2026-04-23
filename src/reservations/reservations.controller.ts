import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('reservations')
@UseGuards(AuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Req() req: any, @Body() createReservationDto: any) {
    return this.reservationsService.create(req.user.uid, createReservationDto);
  }

  @Get('doctor')
  findForDoctor(
    @Req() req: any,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    if (doctorId) {
      return this.reservationsService.findForDoctor(doctorId, date, true);
    }
    return this.reservationsService.findForDoctor(req.user.uid, date, false);
  }

  @Get('patient')
  findForPatient(@Req() req: any) {
    return this.reservationsService.findForPatient(req.user.uid);
  }

  @Get('patient/upcoming')
  findUpcomingForPatient(@Req() req: any) {
    return this.reservationsService.findUpcomingForPatient(req.user.uid);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return this.reservationsService.updateStatus(id, statusData);
  }
}
