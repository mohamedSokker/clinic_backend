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

  @Get('doctor/paginated')
  findPaginatedForDoctor(
    @Req() req: any,
    @Query('date') date?: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
    @Query('next_only') nextOnly?: string,
  ) {
    return this.reservationsService.findPaginatedForDoctor(
      req.user.uid,
      date,
      parseInt(page),
      parseInt(perPage),
      nextOnly === 'true',
    );
  }

  @Get('lab/paginated')
  findPaginatedForLab(
    @Req() req: any,
    @Query('date') date?: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
    @Query('next_only') nextOnly?: string,
  ) {
    return this.reservationsService.findPaginatedForLab(
      req.user.uid,
      date,
      parseInt(page),
      parseInt(perPage),
      nextOnly === 'true',
    );
  }

  @Get('patient')
  findForPatient(@Req() req: any) {
    return this.reservationsService.findForPatient(req.user.uid);
  }

  @Get('patient/upcoming')
  findUpcomingForPatient(@Req() req: any) {
    return this.reservationsService.findUpcomingForPatient(req.user.uid);
  }

  @Get('patient/paginated')
  findPaginatedForPatient(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
  ) {
    return this.reservationsService.findPaginatedForPatient(
      req.user.uid,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Get('patient/live-queue')
  getLiveQueueForPatient(
    @Req() req: any,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.reservationsService.getLiveQueueForPatient(req.user.uid, doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Get('lab/:labId')
  findForLab(@Param('labId') labId: string, @Query('date') date?: string) {
    return this.reservationsService.findForLab(labId, date);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusData: any) {
    return this.reservationsService.updateStatus(id, statusData);
  }
}
