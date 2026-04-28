import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!reservation.doctorId)
      throw new BadRequestException(
        'Diagnosis can only be created for doctor reservations',
      );

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

  async findForPatient(patientUserId: string, page: number = 1, perPage: number = 3) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: patientUserId } },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const [diagnoses, total] = await Promise.all([
      this.prisma.diagnosis.findMany({
        where: { patientId: patient.id },
        orderBy: { visitDate: 'desc' },
        include: {
          doctor: { include: { user: true } },
          vaccines: true,
          analysisFiles: true,
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.diagnosis.count({
        where: { patientId: patient.id },
      }),
    ]);

    return {
      diagnoses,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findForSpecificPatient(patientId: string) {
    return this.prisma.diagnosis.findMany({
      where: { patientId },
      orderBy: { visitDate: 'desc' },
      include: {
        doctor: { include: { user: true } },
        vaccines: true,
        analysisFiles: true,
      },
    });
  }

  async findForSpecificPatientPaginated(patientId: string, page: number = 1, perPage: number = 3) {
    const [diagnoses, total] = await Promise.all([
      this.prisma.diagnosis.findMany({
        where: { patientId },
        orderBy: { visitDate: 'desc' },
        include: {
          doctor: { include: { user: true } },
          vaccines: true,
          analysisFiles: true,
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.diagnosis.count({
        where: { patientId },
      }),
    ]);

    return {
      diagnoses,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async addAnalysisFile(labUserId: string, fileData: any) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: labUserId } },
    });
    if (!lab) throw new NotFoundException('Lab not found');

    const { diagnosisId, patientId, url, type, fileName } = fileData;

    return this.prisma.analysisFile.create({
      data: {
        diagnosisId: diagnosisId || null,
        patientId: patientId || null,
        labId: lab.id,
        url,
        type,
        fileName,
      },
    });
  }
  async findByReservation(reservationId: string) {
    return this.prisma.diagnosis.findUnique({
      where: { reservationId },
      include: {
        vaccines: true,
        analysisFiles: true,
      },
    });
  }
}
