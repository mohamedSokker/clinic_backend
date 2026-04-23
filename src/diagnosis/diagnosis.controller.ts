import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
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
  findForPatient(@Req() req: any) {
    return this.diagnosisService.findForPatient(req.user.uid);
  }

  @Post('analysis')
  addAnalysisFile(@Req() req: any, @Body() fileData: any) {
    return this.diagnosisService.addAnalysisFile(req.user.uid, fileData);
  }
}
