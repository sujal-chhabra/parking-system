import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParkingService } from './parking.service';
import { CreateParkingLotDto } from './dto/create-parking-lot.dto';
import { ExpandParkingLotDto } from './dto/expand-parking-lot.dto';
import { ParkCarDto } from './dto/park-car.dto';
import { ClearSlotDto } from './dto/clear-slot.dto';

@Controller()
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) { }

  /** 🏠 Root welcome route */
  @Get()
  @HttpCode(HttpStatus.OK)
  getRootMessage() {
    return { message: '🚗 Car Parking System is running!' };
  }

  /** Initialize a new parking lot */
  @Post('parking_lot')
  @HttpCode(HttpStatus.CREATED)
  initialize(
    @Body() createDto: CreateParkingLotDto,
  ): { total_slot: number } {
    const total = this.parkingService.initializeParkingLot(
      createDto.no_of_slot,
    );
    return { total_slot: total };
  }

  /** Expand existing parking lot */
  @Patch('parking_lot')
  @HttpCode(HttpStatus.OK)
  expand(
    @Body() expandDto: ExpandParkingLotDto,
  ): { total_slot: number } {
    const total = this.parkingService.expandParkingLot(
      expandDto.increment_slot,
    );
    return { total_slot: total };
  }

  /** Park a new car */
  @Post('park')
  @HttpCode(HttpStatus.CREATED)
  park(
    @Body() parkDto: ParkCarDto,
  ): { allocated_slot_number: number } {
    const slotNo = this.parkingService.parkCar(
      parkDto.car_reg_no,
      parkDto.car_color,
    );
    return { allocated_slot_number: slotNo };
  }

  /** Free a slot (by slot or by registration) */
  @Post('clear')
  @HttpCode(HttpStatus.OK)
  clear(
    @Body() clearDto: ClearSlotDto,
  ): { freed_slot_number: number } {
    const freed = this.parkingService.clearSlot(
      clearDto.slot_number,
      clearDto.car_registration_no,
    );
    return { freed_slot_number: freed };
  }

  /** Get all occupied slots with details */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  status(): {
    slot_no: number;
    registration_no: string;
    color: string;
  }[] {
    return this.parkingService.getStatus().map((s) => ({
      slot_no: s.slotNumber,
      registration_no: s.car!.registrationNumber,
      color: s.car!.color,
    }));
  }

  /** Get all registration numbers for cars of a given color */
  @Get('registration_numbers/:color')
  @HttpCode(HttpStatus.OK)
  getRegistrationsByColor(
    @Param('color') color: string,
  ): string[] {
    return this.parkingService.getRegistrationNumbersByColor(color);
  }

  /** Get all slot numbers (as strings) for cars of a given color */
  @Get('slot_numbers/:color')
  @HttpCode(HttpStatus.OK)
  getSlotsByColor(
    @Param('color') color: string,
  ): string[] {
    return this.parkingService
      .getSlotNumbersByColor(color)
      .map((n) => n.toString());
  }

  /** Get the slot number for a given car registration */
  @Get('slot_number/:registration')
  @HttpCode(HttpStatus.OK)
  getSlotByRegistration(
    @Param('registration') reg: string,
  ): { slot_number: number } {
    const slotNo = this.parkingService.getSlotNumberByRegistrationNumber(
      reg,
    );
    return { slot_number: slotNo };
  }
}
