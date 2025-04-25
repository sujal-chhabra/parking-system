import { IsString } from 'class-validator';

export class ParkCarDto {
    @IsString()
    car_reg_no: string;

    @IsString()
    car_color: string;
}