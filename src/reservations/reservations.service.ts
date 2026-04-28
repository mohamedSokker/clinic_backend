import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        lab: { include: { user: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return this.formatReservation(reservation);
  }

  async create(userId: string, createReservationDto: any) {
    const { doctorId, labId, dateTime, symptoms, isEmergency, selectedTest } =
      createReservationDto;

    // 1. Resolve target patient
    let targetPatientId: string;
    const requester = await this.prisma.user.findUnique({
      where: { uid: userId },
      include: { patient: true, doctor: true, lab: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    if (requester.patient) {
      targetPatientId = requester.patient.id;
    } else if ((requester.doctor || requester.lab) && isEmergency) {
      // Doctor/Lab adding emergency patient
      const { patientName, patientMobile } = createReservationDto;
      if (!patientName)
        throw new BadRequestException(
          'Patient name is required for emergency insertion',
        );

      // Try to find user by mobile (if provided) or name
      let patientUser = await this.prisma.user.findFirst({
        where: { mobile: patientMobile || undefined, name: patientName },
        include: { patient: true },
      });

      if (!patientUser) {
        patientUser = await this.prisma.user.create({
          data: {
            name: patientName,
            email: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@vitreous.clinic`,
            mobile: patientMobile || null,
            role: 'patient',
            uid: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          },
          include: { patient: true },
        });
      }

      if (!patientUser)
        throw new BadRequestException(
          'Failed to resolve or create patient user',
        );

      if (!patientUser.patient) {
        const newPatient = await this.prisma.patient.create({
          data: { userId: patientUser.id },
        });
        targetPatientId = newPatient.id;
      } else {
        targetPatientId = patientUser.patient.id;
      }
    } else {
      throw new BadRequestException(
        'Only patients can create standard reservations.',
      );
    }

    return this.formatReservation(
      this.prisma.$transaction(async (tx) => {
        // 2. Lock the doctor or lab record to prevent concurrent bookings
        if (doctorId) {
          await tx.$executeRaw`SELECT id FROM "Doctor" WHERE id = ${doctorId} FOR UPDATE`;
        } else if (labId) {
          await tx.$executeRaw`SELECT id FROM "Lab" WHERE id = ${labId} FOR UPDATE`;
        }

        // 3. Check if slot is already taken (Collision Prevention)
        if (doctorId && dateTime) {
          const existing = await tx.reservation.findFirst({
            where: {
              doctorId,
              dateTime: new Date(dateTime),
              status: { notIn: ['cancelled', 'no_show'] },
            },
          });
          if (existing) {
            throw new BadRequestException(
              'This time slot is already reserved.',
            );
          }
        }

        // 3. Calculate queue position for the day
        const date = new Date(dateTime);
        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

        if (isEmergency) {
          // Emergency logic: Insert at the earliest upcoming slot and shift everyone
          const activeReservations = await tx.reservation.findMany({
            where: {
              doctorId: doctorId || undefined,
              labId: labId || undefined,
              dateTime: {
                gte: startOfDay,
                lte: endOfDay,
              },
              status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
            },
            orderBy: { dateTime: 'asc' },
          });

          if (activeReservations.length > 0) {
            let duration = 30;
            if (doctorId) {
              const doctor = await tx.doctor.findUnique({
                where: { id: doctorId },
              });
              duration = doctor?.slotDurationMinutes || 30;
            }

            // Find where to insert. If someone is inside, insert after them.
            const insideIdx = activeReservations.findIndex(
              (r) => r.status === 'inside',
            );
            let shiftFromIdx = insideIdx === -1 ? 0 : insideIdx + 1;

            const reservationsToShift = activeReservations.slice(shiftFromIdx);
            let insertionTime =
              reservationsToShift.length > 0
                ? new Date(reservationsToShift[0].dateTime)
                : new Date(
                    activeReservations[
                      activeReservations.length - 1
                    ].dateTime.getTime() +
                      duration * 60000,
                  );

            // Shift subsequent reservations
            for (const res of reservationsToShift) {
              const newTime = new Date(
                res.dateTime.getTime() + duration * 60000,
              );
              await tx.reservation.update({
                where: { id: res.id },
                data: {
                  dateTime: newTime,
                  expectedTime: newTime,
                  queuePosition: res.queuePosition + 1,
                },
              });

              // Notify shifted patient
              const patientUser = await tx.user.findFirst({
                where: { patient: { id: res.patientId } },
              });

              if (patientUser) {
                const timeStr = newTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                if (patientUser.fcmToken) {
                  try {
                    await this.notificationsService.sendMessage({
                      title: '⚠️ Schedule Update',
                      body: `Due to an emergency, your appointment has been shifted. New time: ${timeStr}. We apologize for the delay.`,
                      Tokens: [patientUser.fcmToken],
                    });
                  } catch (e) {
                    // Log but don't fail the transaction
                    console.error(
                      `Failed to send shift notification to ${patientUser.id}:`,
                      e.message,
                    );
                  }
                }
                await this.notificationsService.createNotification({
                  userId: patientUser.id,
                  title: 'Appointment Shifted',
                  body: `Emergency insertion has delayed your appointment to ${timeStr}. Sorry for the inconvenience.`,
                  type: 'alert',
                  relatedId: res.id,
                });
              }
            }

            // Create emergency reservation
            return tx.reservation.create({
              data: {
                doctorId: doctorId || null,
                labId: labId || null,
                patientId: targetPatientId,
                dateTime: insertionTime,
                symptoms,
                isEmergency: true,
                queuePosition:
                  activeReservations[shiftFromIdx]?.queuePosition ||
                  activeReservations.length + 1,
                status: 'pending',
                selectedTest,
              },
              include: {
                doctor: { include: { user: true } },
                lab: { include: { user: true } },
                patient: { include: { user: true } },
              },
            });
          }
        }

        const count = await tx.reservation.count({
          where: {
            doctorId: doctorId || undefined,
            labId: labId || undefined,
            dateTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: { notIn: ['cancelled', 'no_show'] },
          },
        });

        return tx.reservation.create({
          data: {
            doctorId: doctorId || null,
            labId: labId || null,
            patientId: targetPatientId,
            dateTime: new Date(dateTime),
            symptoms,
            isEmergency: isEmergency || false,
            queuePosition: count + 1,
            status: 'pending',
            selectedTest,
          },
          include: {
            doctor: { include: { user: true } },
            lab: { include: { user: true } },
            patient: {
              include: { user: true },
            },
          },
        });
      }),
    );
  }

  async findForDoctor(identifier: string, date?: string, isInternalId = false) {
    const whereCondition = isInternalId
      ? { id: identifier }
      : { user: { uid: identifier } };

    const doctor = await this.prisma.doctor.findFirst({
      where: whereCondition,
    });
    if (!doctor) throw new NotFoundException('Doctor record not found');

    const where: any = {
      doctorId: doctor.id,
      status: { notIn: ['cancelled', 'no_show'] },
    };
    if (date) {
      const d = new Date(date);
      where.dateTime = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    return this.formatReservation(
      this.prisma.reservation.findMany({
        where,
        orderBy: { queuePosition: 'asc' },
        include: {
          patient: { include: { user: true } },
        },
      }),
    );
  }

  async findPaginatedForDoctor(
    identifier: string,
    date?: string,
    page: number = 1,
    perPage: number = 3,
    nextOnly: boolean = false,
  ) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { user: { uid: identifier } },
    });
    if (!doctor) throw new NotFoundException('Doctor record not found');

    const statusFilter = { notIn: ['cancelled', 'no_show'] };

    const where: any = {
      doctorId: doctor.id,
      status: statusFilter,
    };
    if (date) {
      const d = new Date(date);
      where.dateTime = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: { queuePosition: 'asc' },
        include: {
          patient: { include: { user: true } },
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      reservations: this.formatReservation(reservations),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findForLab(labId: string, date?: string) {
    const where: any = { labId };
    if (date) {
      const d = new Date(date);
      where.dateTime = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    return this.formatReservation(
      this.prisma.reservation.findMany({
        where,
        orderBy: { dateTime: 'asc' },
        include: {
          patient: { include: { user: true } },
        },
      }),
    );
  }

  async findForPatient(userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    return this.formatReservation(
      this.prisma.reservation.findMany({
        where: { patientId: patient.id },
        orderBy: { dateTime: 'desc' },
        include: {
          doctor: { include: { user: true } },
          lab: { include: { user: true } },
        },
      }),
    );
  }

  async findPaginatedForPatient(
    userId: string,
    page: number = 1,
    perPage: number = 3,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    const where = { patientId: patient.id };

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: { dateTime: 'desc' },
        include: {
          doctor: { include: { user: true } },
          lab: { include: { user: true } },
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      reservations: this.formatReservation(reservations),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async getLiveQueueForPatient(userId: string, requestedDoctorId?: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    let doctorId = requestedDoctorId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (!doctorId) {
      // Find the patient's earliest active reservation today
      const activeRes = await this.prisma.reservation.findFirst({
        where: {
          patientId: patient.id,
          doctorId: { not: null },
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: ['pending', 'confirmed', 'waiting', 'inside', 'done'] },
        },
        orderBy: { dateTime: 'asc' },
      });
      if (activeRes) {
        doctorId = activeRes.doctorId ?? undefined;
      }
    }

    if (!doctorId) {
      return { clinicInfo: null, queue: [], myPatientId: patient.id };
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const queueReservations = await this.prisma.reservation.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        OR: [
          { status: { in: ['pending', 'confirmed', 'waiting', 'inside'] } },
          { status: 'done' },
        ],
      },
      orderBy: { queuePosition: 'asc' },
    });

    // Anonymize the data
    const queue = queueReservations.map((r) => ({
      id: r.id,
      patientId: r.patientId, // Safe to send ID so the app can highlight "You"
      queuePosition: r.queuePosition,
      status: r.status,
      expectedTime: r.expectedTime,
      dateTime: r.expectedTime || r.dateTime,
      entryTime: r.entryTime,
      exitTime: r.exitTime,
      isEmergency: r.isEmergency,
      durationMinutes:
        r.entryTime && r.exitTime
          ? Math.round((r.exitTime.getTime() - r.entryTime.getTime()) / 60000)
          : null,
    }));

    return {
      clinicInfo: {
        doctorName: doctor?.doctorName || doctor?.user?.name,
        clinicName: doctor?.clinicName,
      },
      queue,
      myPatientId: patient.id,
    };
  }

  async updateStatus(id: string, statusData: any) {
    const { status, consultationNote } = statusData;
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { doctor: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const data: any = { status };
    if (status === 'inside') data.entryTime = new Date();
    if (status === 'done') {
      data.exitTime = new Date();
      data.consultationNote = consultationNote;
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data,
    });

    // If a session is done, shift the next patients' expected times
    if (status === 'done') {
      if (reservation.doctorId) {
        await this.shiftQueue(
          'doctor',
          reservation.doctorId,
          data.exitTime,
          reservation.dateTime,
        );
      } else if (reservation.labId) {
        await this.shiftQueue(
          'lab',
          reservation.labId,
          data.exitTime,
          reservation.dateTime,
        );
      }
    }

    return updated;
  }

  private async shiftQueue(
    type: 'doctor' | 'lab',
    targetId: string,
    lastExitTime: Date,
    lastPlannedTime: Date,
  ) {
    let duration = 30;
    if (type === 'doctor') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: targetId },
      });
      duration = doctor?.slotDurationMinutes || 30;
    } else {
      const lab = await this.prisma.lab.findUnique({
        where: { id: targetId },
      });
      duration = 30; // Default for labs if not specified, could be avgTurnaroundTime
    }

    const endOfDay = new Date(lastPlannedTime);
    endOfDay.setHours(23, 59, 59, 999);

    const nextReservations = await this.prisma.reservation.findMany({
      where: {
        doctorId: type === 'doctor' ? targetId : undefined,
        labId: type === 'lab' ? targetId : undefined,
        dateTime: {
          gt: lastPlannedTime,
          lte: endOfDay,
        },
        status: { in: ['pending', 'confirmed', 'waiting'] },
      },
      orderBy: { dateTime: 'asc' },
    });

    const currentExpected = new Date(lastExitTime);
    for (const res of nextReservations) {
      await this.prisma.reservation.update({
        where: { id: res.id },
        data: { expectedTime: new Date(currentExpected) },
      });
      currentExpected.setMinutes(currentExpected.getMinutes() + duration);
    }
  }

  async findUpcomingForPatient(userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { user: { uid: userId } },
    });
    if (!patient) throw new NotFoundException('Patient record not found');

    const now = new Date();
    return this.formatReservation(
      this.prisma.reservation.findFirst({
        where: {
          patientId: patient.id,
          status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
          dateTime: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
        orderBy: { dateTime: 'asc' },
        include: {
          doctor: { include: { user: true } },
          lab: { include: { user: true } },
          patient: { include: { user: true } },
        },
      }),
    );
  }

  private formatReservation(res: any): any {
    if (!res) return res;
    if (res && typeof res.then === 'function') {
      return res.then((resolved: any) => this.formatReservation(resolved));
    }
    if (Array.isArray(res)) return res.map((r) => this.formatReservation(r));
    return {
      ...res,
      dateTime: res.expectedTime || res.dateTime,
    };
  }
}
