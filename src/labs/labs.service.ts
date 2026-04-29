import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    type?: string,
    query?: string,
    lat?: number,
    lng?: number,
    radius?: number,
  ) {
    const labs = await this.prisma.lab.findMany({
      where: {
        AND: [
          type ? { type } : {},
          query
            ? {
                OR: [
                  { labName: { contains: query, mode: 'insensitive' } },
                  { location: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
            photoURL: true,
          },
        },
      },
    });

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const { calculateDistance } = require('../common/utils/geo');
      return labs.filter((lab) => {
        if (lab.latitude && lab.longitude) {
          const dist = calculateDistance(lat, lng, lab.latitude, lab.longitude);
          return dist <= radius;
        }
        return false;
      });
    }

    return labs;
  }

  async findOne(id: string) {
    const lab = await this.prisma.lab.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
            photoURL: true,
          },
        },
      },
    });

    if (!lab) {
      throw new NotFoundException(`Lab with ID ${id} not found`);
    }

    return lab;
  }

  async getDashboardData(firebaseUid: string) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: firebaseUid } },
      include: {
        analysisFiles: {
          take: 5,
          orderBy: { uploadedAt: 'desc' },
        },
        reservations: {
          where: { status: 'pending' },
          orderBy: { dateTime: 'asc' },
          take: 5,
          include: {
            patient: { include: { user: true } },
          },
        },
      },
    });

    if (!lab) throw new NotFoundException('Lab record not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTestsCount = await this.prisma.analysisFile.count({
      where: {
        labId: lab.id,
        uploadedAt: { gte: today },
      },
    });

    return {
      stats: {
        todayTests: todayTestsCount,
        totalTests: await this.prisma.analysisFile.count({
          where: { labId: lab.id },
        }),
        syncIntegrity: 98,
      },
      recentUploads: lab.analysisFiles.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        uploadedAt: file.uploadedAt,
        type: file.type,
      })),
      availableAnalysis: ((lab.analysisTypes as any[]) || []).map((type) => ({
        id: type.id,
        name: type.name,
        cost: type.cost,
        status: 'Active',
        progress: 100,
      })),
      appointments: lab.reservations.map((res) => ({
        ...res,
        patientName: res.patient.user.name,
        patientPhoto: res.patient.user.photoURL,
        testType: res.selectedTest || 'General Analysis',
      })),
    };
  }

  async getQueueData(firebaseUid: string) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: firebaseUid } },
      include: {
        crew: true,
        reservations: {
          where: {
            status: { notIn: ['cancelled', 'no_show'] },
          },
          orderBy: { dateTime: 'asc' },
          include: {
            patient: { include: { user: true } },
          },
        },
      },
    });

    if (!lab) throw new NotFoundException('Lab record not found');

    const now = new Date();
    const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date(now).setHours(23, 59, 59, 999));

    const stats = {
      totalActive: lab.reservations.filter((r) => r.status !== 'done').length,
      pending: lab.reservations.filter((r) => r.status === 'pending' || r.status === 'waiting').length,
      inProgress: lab.reservations.filter((r) => r.status === 'inside').length,
      completedToday: lab.reservations.filter(
        (r) => r.status === 'done' && r.dateTime >= todayStart && r.dateTime <= todayEnd
      ).length,
    };

    return {
      labInfo: {
        id: lab.id,
        name: lab.labName,
        accuracy: lab.accuracy,
        avgTurnaroundTime: lab.avgTurnaroundTime,
        crew: lab.crew,
      },
      stats,
      queue: lab.reservations.map((res) => ({
        id: res.id,
        patientName: res.patient.user.name,
        patientPhoto: res.patient.user.photoURL,
        patientId: `ETH-${res.id.slice(0, 4).toUpperCase()}`,
        tags: res.tags,
        symptoms: res.symptoms,
        time: res.dateTime,
        expectedTime: res.expectedTime,
        status: res.status,
        selectedTest: res.selectedTest,
      })),
    };
  }

  async getSchedule(firebaseUid: string) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: firebaseUid } },
      select: { workingHours: true, isAvailable: true },
    });
    if (!lab) throw new Error('Lab not found');
    return lab;
  }

  async updateSchedule(
    firebaseUid: string,
    data: { workingHours: any; isAvailable?: boolean },
  ) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: firebaseUid } },
    });
    if (!lab) throw new Error('Lab not found');

    return this.prisma.lab.update({
      where: { id: lab.id },
      data: {
        workingHours: data.workingHours,
        isAvailable: data.isAvailable,
      },
    });
  }

  async getPatientAnalysis(labUid: string, patientId: string, page: number = 1, perPage: number = 3) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: labUid } },
    });
    if (!lab) throw new NotFoundException('Lab not found');

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            name: true,
            photoURL: true,
            email: true,
            mobile: true,
          },
        },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const recentAnalysis = await this.prisma.analysisFile.findMany({
      where: { patientId, labId: lab.id },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalAnalysisCount = await this.prisma.analysisFile.count({
      where: { patientId, labId: lab.id },
    });

    return {
      patient,
      recentAnalysis,
      totalAnalysisCount,
      page,
      perPage,
      totalPages: Math.ceil(totalAnalysisCount / perPage),
    };
  }

  async deleteAnalysisFile(labUid: string, fileId: string) {
    const lab = await this.prisma.lab.findFirst({
      where: { user: { uid: labUid } },
    });
    if (!lab) throw new NotFoundException('Lab not found');

    const file = await this.prisma.analysisFile.findUnique({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException('File not found');
    if (file.labId !== lab.id) throw new Error('Unauthorized to delete this file');

    return this.prisma.analysisFile.delete({
      where: { id: fileId },
    });
  }
}
