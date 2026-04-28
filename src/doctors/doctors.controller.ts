import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(
    @Query('specialization') specialization?: string,
    @Query('query') query?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.doctorsService.findAll(
      specialization,
      query,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radius ? parseFloat(radius) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch('schedule')
  @UseGuards(AuthGuard)
  updateSchedule(@Req() req: any, @Body() scheduleData: any) {
    return this.doctorsService.updateSchedule(req.user.uid, scheduleData);
  }

  @Patch('costs')
  @UseGuards(AuthGuard)
  updateCosts(@Req() req: any, @Body() costsData: any) {
    return this.doctorsService.updateCosts(req.user.uid, costsData);
  }
}
