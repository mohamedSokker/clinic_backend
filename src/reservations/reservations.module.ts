import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsTasks } from './reservations.tasks';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsTasks],
})
export class ReservationsModule {}
