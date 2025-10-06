import { Trip } from '../entities/trip.entity';
import { TripId } from '../value-objects/trip-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface ITripRepository {
  save(trip: Trip): Promise<void>;
  findById(id: TripId): Promise<Trip | null>;
  findByUserId(userId: UserId): Promise<Trip[]>;
  update(trip: Trip): Promise<void>;
  delete(id: TripId): Promise<void>;
  existsById(id: TripId): Promise<boolean>;
}
