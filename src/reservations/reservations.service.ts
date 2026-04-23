import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReservationDto: any) {
    const { doctorId, dateTime, symptoms, isEmergency } = createReservationDto;

    // 1. Get patient record using Firebase UID
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    // 2. Calculate queue position for the day
    const date = new Date(dateTime);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.prisma.reservation.count({
      where: {
        doctorId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['cancelled', 'no_show'] },
      },
    });

    return this.prisma.reservation.create({
      data: {
        doctorId,
        patientId: patient.id,
        dateTime: new Date(dateTime),
        symptoms,
        isEmergency: isEmergency || false,
        queuePosition: count + 1,
        status: 'pending',
      },
      include: {
        doctor: true,
        patient: {
          include: { user: true },
        },
      },
    });
  }

  async findForDoctor(identifier: string, date?: string, isInternalId = false) {
    const whereCondition = isInternalId
      ? { id: identifier }
      : { user: { uid: identifier } };

    const doctor = await this.prisma.doctor.findFirst({
      where: whereCondition,
    });
    if (!doctor) throw new NotFoundException('Doctor record not found');

    const where: any = { doctorId: doctor.id };
    if (date) {
      const d = new Date(date);
      where.dateTime = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    return this.prisma.reservation.findMany({
      where,
      orderBy: { queuePosition: 'asc' },
      include: {
        patient: { include: { user: true } },
      },
    });
  }

  async findForPatient(userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    return this.prisma.reservation.findMany({
      where: { patientId: patient.id },
      orderBy: { dateTime: 'desc' },
      include: {
        doctor: { include: { user: true } },
      },
    });
  }

  async updateStatus(id: string, statusData: any) {
    const { status, consultationNote } = statusData;
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const data: any = { status };
    if (status === 'inside') data.entryTime = new Date();
    if (status === 'done') {
      data.exitTime = new Date();
      data.consultationNote = consultationNote;
    }

    return this.prisma.reservation.update({
      where: { id },
      data,
    });
  }

  async findUpcomingForPatient(userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    const now = new Date();
    return this.prisma.reservation.findFirst({
      where: {
        patientId: patient.id,
        status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
        dateTime: { gte: new Date(now.setHours(0, 0, 0, 0)) },
      },
      orderBy: { dateTime: 'asc' },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
  }
}
