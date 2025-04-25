import { Car } from './car.model';

export interface ParkingSlot {
    slotNumber: number;
    car: Car | null;
}