import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Patch,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { LabsService } from './labs.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('query') query?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.labsService.findAll(
      type,
      query,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radius ? parseFloat(radius) : undefined,
    );
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  async getDashboard(@Req() req: any) {
    return this.labsService.getDashboardData(req.user.uid);
  }

  @Get('queue')
  @UseGuards(AuthGuard)
  async getQueue(@Req() req: any) {
    return this.labsService.getQueueData(req.user.uid);
  }

  @Get('schedule')
  @UseGuards(AuthGuard)
  async getSchedule(@Req() req: any) {
    return this.labsService.getSchedule(req.user.uid);
  }

  @Patch('schedule')
  @UseGuards(AuthGuard)
  async updateSchedule(@Req() req: any, @Body() body: any) {
    return this.labsService.updateSchedule(req.user.uid, body);
  }

  @Get('patient-analysis/:patientId')
  @UseGuards(AuthGuard)
  async getPatientAnalysis(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
  ) {
    return this.labsService.getPatientAnalysis(
      req.user.uid,
      patientId,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Delete('analysis/:fileId')
  @UseGuards(AuthGuard)
  async deleteAnalysisFile(@Req() req: any, @Param('fileId') fileId: string) {
    return this.labsService.deleteAnalysisFile(req.user.uid, fileId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.labsService.findOne(id);
  }
}
