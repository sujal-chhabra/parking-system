import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';
import { CreateParkingLotDto } from './dto/create-parking-lot.dto';
import { ExpandParkingLotDto } from './dto/expand-parking-lot.dto';
import { ParkCarDto } from './dto/park-car.dto';
import { ClearSlotDto } from './dto/clear-slot.dto';

describe('ParkingController', () => {
  let controller: ParkingController;
  let service: ParkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingController],
      providers: [ParkingService],
    }).compile();

    controller = module.get<ParkingController>(ParkingController);
    service = module.get<ParkingService>(ParkingService);

    // Mirror app setup: enable DTO validation
    module.useLogger(false);
    (controller as any).app = {
      useGlobalPipes: () =>
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    };
  });

  it('POST /parking_lot should create lot', () => {
    const dto = new CreateParkingLotDto();
    dto.no_of_slot = 4;
    const res = controller.initialize(dto);
    expect(res).toEqual({ total_slot: 4 });
  });

  it('PATCH /parking_lot should expand lot', () => {
    service.initializeParkingLot(2);
    const dto = new ExpandParkingLotDto();
    dto.increment_slot = 3;
    expect(controller.expand(dto)).toEqual({ total_slot: 5 });
  });

  it('POST /park should allocate slot', () => {
    service.initializeParkingLot(2);
    const dto = new ParkCarDto();
    dto.car_reg_no = 'XYZ';
    dto.car_color = 'green';
    const res = controller.park(dto);
    expect(res).toEqual({ allocated_slot_number: 1 });
  });

  it('POST /clear should free slot by number', () => {
    service.initializeParkingLot(1);
    service.parkCar('A1', 'black');
    const dto = new ClearSlotDto();
    dto.slot_number = 1;
    expect(controller.clear(dto)).toEqual({ freed_slot_number: 1 });
  });

  it('GET /status should list occupied slots', () => {
    service.initializeParkingLot(2);
    service.parkCar('A1', 'red');
    service.parkCar('B2', 'blue');
    const res = controller.status();
    expect(res).toEqual([
      { slot_no: 1, registration_no: 'A1', color: 'red' },
      { slot_no: 2, registration_no: 'B2', color: 'blue' },
    ]);
  });

  it('GET /registration_numbers/:color returns regs', () => {
    service.initializeParkingLot(2);
    service.parkCar('A1', 'red');
    expect(controller.getRegistrationsByColor('red')).toEqual(['A1']);
  });

  it('GET /slot_numbers/:color returns slots', () => {
    service.initializeParkingLot(3);
    service.parkCar('C1', 'yellow'); // slot 1
    service.parkCar('C2', 'yellow'); // slot 2
    expect(controller.getSlotsByColor('yellow')).toEqual(['1', '2']);
  });

  it('GET /slot_number/:registration returns slot', () => {
    service.initializeParkingLot(2);
    service.parkCar('REG123', 'white');
    expect(controller.getSlotByRegistration('REG123')).toEqual({ slot_number: 1 });
  });
});
