import { IsOptional, IsInt, IsString } from 'class-validator';

export class ClearSlotDto {
    @IsOptional()
    @IsInt()
    slot_number?: number;

    @IsOptional()
    @IsString()
    car_registration_no?: string;
}