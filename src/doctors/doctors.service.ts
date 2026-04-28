import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    specialization?: string,
    query?: string,
    lat?: number,
    lng?: number,
    radius?: number,
  ) {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        AND: [
          specialization ? { specialization } : {},
          query
            ? {
                OR: [
                  { doctorName: { contains: query, mode: 'insensitive' } },
                  { clinicName: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
          { subscriptionActive: true },
        ],
      },
      include: {
        user: true,
      },
    });

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const { calculateDistance } = require('../common/utils/geo');
      return doctors.filter((doctor) => {
        if (doctor.latitude && doctor.longitude) {
          const dist = calculateDistance(lat, lng, doctor.latitude, doctor.longitude);
          return dist <= radius;
        }
        return false;
      });
    }

    return doctors;
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        reviews: true,
      },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async updateSchedule(uid: string, scheduleData: any) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { user: { uid } },
    });
    if (!doctor) throw new NotFoundException('Doctor record not found');

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        schedule: scheduleData.schedule,
        workingDays: scheduleData.workingDays,
        slotDurationMinutes: scheduleData.slotDurationMinutes,
      },
    });
  }

  async updateCosts(
    uid: string,
    costs: {
      visitCost?: number;
      videoConsultCost?: number;
      inPersonCost?: number;
    },
  ) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { user: { uid } },
    });
    if (!doctor) throw new NotFoundException('Doctor record not found');

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: costs,
    });
  }
}
