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
  Delete,
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

  @Patch('fcm-token')
  @UseGuards(AuthGuard)
  updateFcmToken(@Req() req: any, @Body('fcmToken') fcmToken: string) {
    return this.usersService.updateFcmToken(req.user.uid, fcmToken);
  }

  @Get('patient/activity')
  @UseGuards(AuthGuard)
  getPatientActivity(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '10',
  ) {
    return this.usersService.getPatientActivity(
      req.user.uid,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Get('patient/analysis')
  @UseGuards(AuthGuard)
  getPatientAnalysis(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
  ) {
    return this.usersService.getPaginatedAnalysis(
      req.user.uid,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Delete('patient/analysis/:fileId')
  @UseGuards(AuthGuard)
  deleteAnalysis(@Req() req: any, @Param('fileId') fileId: string) {
    return this.usersService.deleteAnalysisFile(req.user.uid, fileId);
  }

  @Get('patient/:patientId/full-profile')
  @UseGuards(AuthGuard)
  getPatientFullProfile(@Param('patientId') patientId: string) {
    return this.usersService.getPatientFullProfile(patientId);
  }

  @Get('patient/:patientId/activity')
  @UseGuards(AuthGuard)
  getPatientActivityByDoctor(
    @Param('patientId') patientId: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '10',
  ) {
    return this.usersService.getPatientActivityByPatientId(
      patientId,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Get('patient/:patientId/analysis')
  @UseGuards(AuthGuard)
  getPatientAnalysisByDoctor(
    @Param('patientId') patientId: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '10',
  ) {
    return this.usersService.getPaginatedAnalysisByPatientId(
      patientId,
      parseInt(page),
      parseInt(perPage),
    );
  }
}
