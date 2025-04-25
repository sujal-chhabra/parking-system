# 🚗 Car Parking System API (NestJS + TypeScript)

This is a RESTful API for a car parking system built using **NestJS** in **TypeScript**.  
It uses in-memory data structures (no database) and supports efficient slot allocation using a **Min-Heap**.

---

## 📦 Features

- ✅ Initialize and expand parking lot
- ✅ Allocate the nearest parking slot
- ✅ Free a parking slot by slot number or car registration
- ✅ Get all parked cars
- ✅ Search cars by color
- ✅ Get slot by registration number
- ✅ Unit tested with Jest
- ✅ Dockerized for easy use

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v16+)
- npm
- (Optional) Docker & Docker Compose

---

## 🧑‍💻 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/parking-system.git
cd parking-system

2. Install Dependencies
npm install

3. Start the App in Dev Mode
npm run start:dev

App will be available at:
👉 http://localhost:3000

🐳 Run with Docker (Optional)
1. Build Docker Image
docker build -t parking-system .

2. Run the Container
docker run -p 3000:3000 parking-system

Now the API is available at:
👉 http://localhost:3000

🧪 Run Tests
npm run test
Unit tests are written with Jest and cover core service logic and controllers.

📘 API Endpoints [TO BE TESTED ON POSTMAN]

🧱 1. Initialize Parking Lot
POST /parking_lot

{ "no_of_slot": 6 }

➕ 2. Expand Parking Lot
PATCH /parking_lot
{ "increment_slot": 3 }

🚘 3. Park a Car
POST /park
{
  "car_reg_no": "KA-01-HH-1234",
  "car_color": "red"
}

🗑️ 4. Clear a Slot
POST /clear
By slot number:
{ "slot_number": 1 }

Or by registration:
{ "car_registration_no": "KA-01-HH-1234" }

📋 5. Get Parking Status
GET /status

🎨 6. Get Registrations by Color
GET /registration_numbers/:color

🎯 7. Get Slot Numbers by Color
GET /slot_numbers/:color

🔍 8. Get Slot by Registration Number
GET /slot_number/:registration

🏠 9. Welcome Route (optional)
GET /
{ "message": "🚗 Car Parking System is running!" }
