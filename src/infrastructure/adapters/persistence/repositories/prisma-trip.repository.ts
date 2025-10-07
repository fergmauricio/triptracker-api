import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Trip } from '@domain/entities/trip.entity';
import { TripId } from '@domain/value-objects/trip-id.vo';
import { UserId } from '@domain/value-objects/user-id.vo';
import { ITripRepository } from '@domain/ports/trip-repository.port';

@Injectable()
export class PrismaTripRepository implements ITripRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(trip: Trip): Promise<void> {
    const tripData = {
      title: trip.getTitle(),
      description: trip.getDescription(),
      thumb: trip.getThumb(),
      start_date: trip.getStartDate(),
      end_date: trip.getEndDate(),
      user_id: trip.getUserId().getValue(),
    };

    const created = await this.prisma.trip.create({
      data: tripData,
    });

    trip.updateId(created.id_trip);
  }

  async findById(id: TripId): Promise<Trip | null> {
    const trip = await this.prisma.trip.findUnique({
      where: { id_trip: id.getValue() },
    });

    if (!trip) {
      return null;
    }

    if (trip.user_id === null) {
      throw new Error('VIAGEM_SEM_USUARIO_ASSOCIADO');
    }

    return Trip.fromPersistence(
      trip.id_trip,
      trip.title,
      trip.description,
      trip.thumb,
      trip.start_date,
      trip.end_date,
      trip.user_id,
      trip.created_at || new Date(),
      trip.updated_at,
    );
  }

  async findByUserId(userId: UserId): Promise<Trip[]> {
    const trips = await this.prisma.trip.findMany({
      where: { user_id: userId.getValue() },
      orderBy: { created_at: 'desc' },
    });

    return trips
      .map((trip) => {
        if (trip.user_id === null) {
          return null;
        }

        return Trip.fromPersistence(
          trip.id_trip,
          trip.title,
          trip.description,
          trip.thumb,
          trip.start_date,
          trip.end_date,
          trip.user_id,
          trip.created_at || new Date(),
          trip.updated_at,
        );
      })
      .filter((trip) => trip !== null);
  }

  async update(trip: Trip): Promise<void> {
    await this.prisma.trip.update({
      where: { id_trip: trip.getId().getValue() },
      data: {
        title: trip.getTitle(),
        description: trip.getDescription(),
        thumb: trip.getThumb(),
        start_date: trip.getStartDate(),
        end_date: trip.getEndDate(),
        updated_at: trip.getUpdatedAt(),
      },
    });
  }

  async delete(id: TripId): Promise<void> {
    await this.prisma.trip.delete({
      where: { id_trip: id.getValue() },
    });
  }

  async existsById(id: TripId): Promise<boolean> {
    const trip = await this.prisma.trip.findUnique({
      where: { id_trip: id.getValue() },
      select: { id_trip: true },
    });

    return !!trip;
  }
}
