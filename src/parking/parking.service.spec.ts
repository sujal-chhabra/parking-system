import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ParkingService } from './parking.service';

describe('ParkingService', () => {
  let service: ParkingService;

  beforeEach(() => {
    service = new ParkingService();
  });

  it('should initialize parking lot with given size', () => {
    const total = service.initializeParkingLot(5);
    expect(total).toBe(5);
    expect(service.getStatus()).toHaveLength(0);
  });

  it('should expand parking lot', () => {
    service.initializeParkingLot(3);
    const total = service.expandParkingLot(2);
    expect(total).toBe(5);
    // All slots should be free, so status remains empty
    expect(service.getStatus()).toHaveLength(0);
  });

  it('should park cars in nearest slots and update maps', () => {
    service.initializeParkingLot(3);
    const slot1 = service.parkCar('KA-01-AA-0001', 'red');
    const slot2 = service.parkCar('KA-01-AA-0002', 'blue');
    expect(slot1).toBe(1);
    expect(slot2).toBe(2);

    // Status should list two occupied
    const status = service.getStatus();
    expect(status.map(s => s.slotNumber).sort()).toEqual([1, 2]);

    // Color‐based lookups
    expect(service.getRegistrationNumbersByColor('red')).toEqual(['KA-01-AA-0001']);
    expect(service.getSlotNumbersByColor('blue')).toEqual([2]);

    // Reg‐based lookup
    expect(service.getSlotNumberByRegistrationNumber('KA-01-AA-0002')).toBe(2);
  });

  it('should throw when parking lot is full', () => {
    service.initializeParkingLot(1);
    service.parkCar('CAR1', 'white');
    expect(() => service.parkCar('CAR2', 'black')).toThrow(BadRequestException);
  });

  it('should throw on duplicate registration', () => {
    service.initializeParkingLot(2);
    service.parkCar('CAR1', 'white');
    expect(() => service.parkCar('CAR1', 'white')).toThrow(BadRequestException);
  });

  it('should clear slot by slot number', () => {
    service.initializeParkingLot(2);
    service.parkCar('CAR1', 'white'); // -> slot 1
    const freed = service.clearSlot(1, undefined);
    expect(freed).toBe(1);
    expect(service.getStatus()).toHaveLength(0);
  });

  it('should clear slot by registration number', () => {
    service.initializeParkingLot(2);
    service.parkCar('CAR1', 'white'); // -> slot 1
    const freed = service.clearSlot(undefined, 'CAR1');
    expect(freed).toBe(1);
    expect(service.getStatus()).toHaveLength(0);
  });

  it('should throw when clearing an empty slot', () => {
    service.initializeParkingLot(1);
    expect(() => service.clearSlot(1, undefined)).toThrow(NotFoundException);
  });

  it('should throw when clearing non‐existent car', () => {
    service.initializeParkingLot(1);
    expect(() => service.clearSlot(undefined, 'NO_CAR')).toThrow(NotFoundException);
  });

  it('should throw if both or none identifiers provided', () => {
    service.initializeParkingLot(1);
    expect(() => service.clearSlot(undefined, undefined)).toThrow(BadRequestException);
    expect(() => service.clearSlot(1, 'ABC')).toThrow(BadRequestException);
  });
});
