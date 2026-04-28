import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('diagnosis')
@UseGuards(AuthGuard)
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  create(@Req() req: any, @Body() createDiagnosisDto: any) {
    return this.diagnosisService.create(req.user.uid, createDiagnosisDto);
  }

  @Get('patient')
  findForPatient(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '3',
  ) {
    return this.diagnosisService.findForPatient(
      req.user.uid,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Get('patient/:patientId')
  findForSpecificPatient(@Param('patientId') patientId: string) {
    return this.diagnosisService.findForSpecificPatient(patientId);
  }

  @Get('patient/:patientId/paginated')
  findForSpecificPatientPaginated(
    @Param('patientId') patientId: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '10',
  ) {
    return this.diagnosisService.findForSpecificPatientPaginated(
      patientId,
      parseInt(page),
      parseInt(perPage),
    );
  }

  @Post('analysis')
  addAnalysisFile(@Req() req: any, @Body() fileData: any) {
    return this.diagnosisService.addAnalysisFile(req.user.uid, fileData);
  }
  @Get('reservation/:reservationId')
  findByReservation(@Param('reservationId') reservationId: string) {
    return this.diagnosisService.findByReservation(reservationId);
  }
}
