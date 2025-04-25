import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ParkingSlot } from './models/slot.model';
import { Car } from './models/car.model';

//
// A simple Min-Heap for slot numbers
//
class MinHeap {
    private heap: number[] = [];

    size(): number {
        return this.heap.length;
    }

    insert(val: number) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): number {
        if (this.heap.length === 0) {
            throw new Error('No available slots');
        }
        const min = this.heap[0];
        const end = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.bubbleDown(0);
        }
        return min;
    }

    private bubbleUp(idx: number) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[idx] < this.heap[parentIdx]) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else break;
        }
    }

    private bubbleDown(idx: number) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;

            if (left < length && this.heap[left] < this.heap[smallest]) smallest = left;
            if (right < length && this.heap[right] < this.heap[smallest]) smallest = right;

            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else break;
        }
    }
}

@Injectable()
export class ParkingService {
    // In-memory data
    private parkingSlots: ParkingSlot[] = [];
    private freeSlots = new MinHeap();
    private regToSlot = new Map<string, number>();
    private colorToSlots = new Map<string, Set<number>>();

    /**
     * Initialize the parking lot with `size` slots (1…size).
     */
    initializeParkingLot(size: number): number {
        // Reset everything
        this.parkingSlots = [];
        this.freeSlots = new MinHeap();
        this.regToSlot.clear();
        this.colorToSlots.clear();

        // Populate slots & heap
        for (let i = 1; i <= size; i++) {
            this.parkingSlots.push({ slotNumber: i, car: null });
            this.freeSlots.insert(i);
        }

        return this.parkingSlots.length;
    }

    /**
     * Expand the lot by adding `increment` more slots.
     */
    expandParkingLot(increment: number): number {
        const start = this.parkingSlots.length + 1;
        for (let i = start; i < start + increment; i++) {
            this.parkingSlots.push({ slotNumber: i, car: null });
            this.freeSlots.insert(i);
        }
        return this.parkingSlots.length;
    }

    /**
     * Park a car with given reg & color. Returns allocated slot number.
     */
    parkCar(registrationNumber: string, color: string): number {
        if (this.freeSlots.size() === 0) {
            throw new BadRequestException('Parking lot is full');
        }
        if (this.regToSlot.has(registrationNumber)) {
            throw new BadRequestException('This car is already parked');
        }

        const slotNo = this.freeSlots.extractMin();
        const car: Car = { registrationNumber, color };
        const slot = this.parkingSlots[slotNo - 1];
        slot.car = car;

        // Update lookup maps
        this.regToSlot.set(registrationNumber, slotNo);
        if (!this.colorToSlots.has(color)) {
            this.colorToSlots.set(color, new Set());
        }
        this.colorToSlots.get(color)!.add(slotNo);

        return slotNo;
    }

    /**
     * Free a slot by either slotNumber or registrationNumber.
     * Returns freed slot number.
     */
    clearSlot(
        slotNumber?: number,
        registrationNumber?: string,
    ): number {
        if ((slotNumber == null && !registrationNumber) ||
            (slotNumber != null && registrationNumber)) {
            throw new BadRequestException(
                'Provide exactly one of slot_number or car_registration_no',
            );
        }

        // Clear by slot number
        if (slotNumber != null) {
            const slot = this.parkingSlots[slotNumber - 1];
            if (!slot || !slot.car) {
                throw new NotFoundException('Slot is already empty');
            }
            const reg = slot.car.registrationNumber;
            const color = slot.car.color;
            // Remove mappings
            this.regToSlot.delete(reg);
            this.colorToSlots.get(color)!.delete(slotNumber);
            slot.car = null;
            this.freeSlots.insert(slotNumber);
            return slotNumber;
        }

        // Clear by registration number
        const reg = registrationNumber!;
        const parkedSlotNo = this.regToSlot.get(reg);
        if (!parkedSlotNo) {
            throw new NotFoundException('Car not found');
        }
        const slot = this.parkingSlots[parkedSlotNo - 1];
        const color = slot.car!.color;
        // Remove mappings
        this.regToSlot.delete(reg);
        this.colorToSlots.get(color)!.delete(parkedSlotNo);
        slot.car = null;
        this.freeSlots.insert(parkedSlotNo);
        return parkedSlotNo;
    }

    /**
     * Returns all occupied slots with car info.
     */
    getStatus(): ParkingSlot[] {
        return this.parkingSlots.filter(s => s.car !== null);
    }

    /**
     * All registration numbers for cars of given color.
     */
    getRegistrationNumbersByColor(color: string): string[] {
        const slots = this.colorToSlots.get(color);
        if (!slots || slots.size === 0) return [];
        return Array.from(slots).map(slotNo =>
            this.parkingSlots[slotNo - 1].car!.registrationNumber,
        );
    }

    /**
     * All slot numbers where cars of given color are parked.
     */
    getSlotNumbersByColor(color: string): number[] {
        const slots = this.colorToSlots.get(color);
        return slots ? Array.from(slots) : [];
    }

    /**
     * Slot number where a car with given registration is parked.
     */
    getSlotNumberByRegistrationNumber(reg: string): number {
        const slotNo = this.regToSlot.get(reg);
        if (!slotNo) {
            throw new NotFoundException('Not found');
        }
        return slotNo;
    }
}
