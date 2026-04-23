import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiagnosisService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDiagnosisDto: any) {
    const {
      reservationId,
      notes,
      prescriptions,
      nextVisitDate,
      vaccines,
      analysisFiles,
    } = createDiagnosisDto;

    // 1. Verify reservation and doctor
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { doctor: true, patient: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    return this.prisma.diagnosis.create({
      data: {
        reservationId,
        patientId: reservation.patientId,
        doctorId: reservation.doctorId,
        visitDate: reservation.dateTime,
        notes,
        prescriptions,
        nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
        vaccines: {
          create: vaccines || [],
        },
        analysisFiles: {
          create: analysisFiles || [],
        },
      },
      include: {
        vaccines: true,
        analysisFiles: true,
      },
    });
  }

  async findForPatient(patientUserId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: patientUserId } },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.diagnosis.findMany({
      where: { patientId: patient.id },
      orderBy: { visitDate: 'desc' },
      include: {
        doctor: { include: { user: true } },
        vaccines: true,
        analysisFiles: true,
      },
    });
  }

  async addAnalysisFile(labUserId: string, fileData: any) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: labUserId } },
    });
    if (!lab) throw new NotFoundException('Lab not found');

    const { diagnosisId, url, type, fileName } = fileData;

    return this.prisma.analysisFile.create({
      data: {
        diagnosisId,
        labId: lab.id,
        url,
        type,
        fileName,
      },
    });
  }
}
