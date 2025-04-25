// src/app.module.ts
import { Module } from '@nestjs/common';
import { ParkingModule } from './parking/parking.module';

@Module({
  imports: [ParkingModule],
})
export class AppModule { }
