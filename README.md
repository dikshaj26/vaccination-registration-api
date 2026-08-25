# Vaccine Registration & Slot Management API

A complete, clean, secure, and production-ready REST API backend for a vaccine registration system (similar to CoWIN/AarogyaSetu) built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 1. Project Overview
This application manages vaccine registrations and booking slots. It enforces strict business rules regarding dose sequences (Dose 2 cannot be booked before Dose 1 is completed), slot capacities (exactly 10 bookings per slot maximum), and modification restrictions (no slot changes allowed less than 24 hours before the slot begins). It utilizes MongoDB Transactions and Atomic Operations to handle high-concurrency race conditions gracefully.

---

## 2. Tech Stack
*   **Backend Framework**: Node.js & Express.js
*   **Database**: MongoDB & Mongoose
*   **Security & Authentication**: JWT (JSON Web Tokens) & bcryptjs (password hashing)
*   **Request Validation**: express-validator
*   **Middlewares**: Cors (Cross-Origin requests), Helmet (HTTP security headers), Morgan (Logger)
*   **Configuration**: dotenv (environment variables)

---

## 3. Folder Structure
```text
vaccine-registration-api/
│
├── scripts/
│   ├── seedAdmin.js             # Script to manually seed Admin credential in DB
│   └── seedSlots.js             # Script to generate 420 slots for November 2024
│
├── src/
│   ├── config/
│   │   └── db.js                # Database connection configuration (with custom DNS fix)
│   │
│   ├── controllers/
│   │   ├── admin.controller.js  # Controller for admin functionalities
│   │   ├── auth.controller.js   # Controller for user registration & login
│   │   ├── booking.controller.js# Controller for slot booking & modifications
│   │   └── slot.controller.js   # Controller for slot queries
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js   # Protects endpoints using Bearer JWT
│   │   ├── role.middleware.js   # Restricts access by user roles
│   │   ├── error.middleware.js  # Centralized application error handler
│   │   └── validation.middleware.js # Standardizes input validation responses
│   │
│   ├── models/
│   │   ├── User.js              # User schema, password hashing, and indexes
│   │   ├── Admin.js             # Admin schema, password hashing, and roles
│   │   ├── Slot.js              # Slot schema, capacity tracker, and compound indexes
│   │   └── Booking.js           # Booking schema (references User & Slot)
│   │
│   ├── routes/
│   │   ├── admin.routes.js      # Map of admin functionalities (/api/admin)
│   │   ├── auth.routes.js       # Map of user auth paths (/api/auth)
│   │   ├── booking.routes.js    # Map of booking paths (/api/bookings)
│   │   └── slot.routes.js       # Map of slot paths (/api/slots)
│   │
│   ├── services/
│   │   ├── admin.service.js     # Admin business logic
│   │   ├── booking.service.js   # Slot booking, atomic allocation, and transactions
│   │   ├── slot.service.js      # Slot search query logic
│   │   └── vaccination.service.js # Automatic slot completion check logic
│   │
│   ├── validators/
│   │   ├── auth.validator.js    # Input validators for registration & login
│   │   ├── booking.validator.js # Input validators for bookings & modifications
│   │   └── admin.validator.js   # Input validators for admin logins & filters
│   │
│   ├── utils/
│   │   ├── date.js              # Date utility with time-travel mocking support
│   │   ├── jwt.js               # JWT generator helper
│   │   └── response.js          # Helper for unified JSON API responses
│   │
│   └── app.js                   # Express application setup
│
├── .env.example                 # Example variables configuration template
├── .gitignore                   # Ignore node_modules, .env, logs
├── package.json                 # Project dependencies & command scripts
├── server.js                    # Entry server execution point
└── README.md                    # This guide
```

---

## 4. Database Design & Relationship Diagram

The application is structured around a relational document mapping:

```mermaid
erDiagram
    USER {
        ObjectId id PK
        string name
        string phoneNumber "unique, index"
        int age "index"
        string pincode "index"
        string aadharNo "unique"
        string password "hashed"
        string vaccinationStatus "index (NONE, FIRST_DOSE_COMPLETED, ALL_COMPLETED)"
    }
    BOOKING {
        ObjectId id PK
        ObjectId userId FK "index"
        ObjectId slotId FK "index"
        int doseNumber "index (1, 2)"
        string status "(SCHEDULED, COMPLETED, CANCELLED)"
        date bookedAt
    }
    SLOT {
        ObjectId id PK
        string date "index (YYYY-MM-DD)"
        string startTime "(HH:MM)"
        string endTime "(HH:MM)"
        int capacity "default: 10"
        int bookedCount "min: 0, max: 10"
    }
    ADMIN {
        ObjectId id PK
        string username "unique"
        string password "hashed"
        string role "default: admin"
    }

    USER ||--o{ BOOKING : "places"
    SLOT ||--o{ BOOKING : "contains"
```

### Models Explanation:
1.  **User Model**: Stores demographic and vaccination profile status. We index `phoneNumber` and `aadharNo` uniquely. We also index `pincode`, `age`, and `vaccinationStatus` for optimal admin filtering query speeds.
2.  **Slot Model**: Represents 30-minute slots. A compound index on `{ date: 1, startTime: 1 }` with a unique constraint prevents duplicate slots.
3.  **Booking Model**: Associates a User with a Slot. Indexes speed up user histories.
4.  **Admin Model**: An isolated collection to authorize administrative dashboards.

---

## 5. Business Rules
1.  **Drive Duration**: November 1st, 2024 to November 30th, 2024.
2.  **Drive Timings**: 10:00 AM to 5:00 PM daily.
3.  **Slot Capacities**: 14 slots/day. Each slot has a maximum capacity of exactly 10 doses.
4.  **Dose Sequence Rule**:
    *   To book Dose 1, status must be `NONE`.
    *   To book Dose 2, status must be `FIRST_DOSE_COMPLETED`.
    *   A dose is considered `COMPLETED` only after its slot ending time has passed.
5.  **24-Hour Rule**: A user can change their booked slot only up to 24 hours before the slot's start time.

---

## 6. Setup & Execution Instructions

### 1. Prerequisite Installations
*   Node.js (v18 or higher recommended)
*   MongoDB Atlas free account

### 2. Install Project Dependencies
Run this in the root project folder:
```powershell
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root folder (or rename `.env.example` to `.env`) and add:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net/vaccine_db?retryWrites=true&w=majority
JWT_SECRET=yourSuperSecretSignatureKey123!
JWT_EXPIRES_IN=7d

# Developer Time-Travel Mocking (Optional for testing constraints)
# MOCK_DATE=2024-10-30T10:00:00
```

### 4. Database Seeding
You must seed the slots and create the default admin account before running the server.

*   **Seed Vaccine Slots (420 slots)**:
    ```powershell
    npm run seed:slots
    ```
*   **Seed Manual Admin Account (user: `admin`, pass: `AdminPassword123`)**:
    ```powershell
    npm run seed:admin
    ```

### 5. Running the Application
*   **Start in Development Mode (Nodemon auto-reload)**:
    ```powershell
    npm run dev
    ```
*   **Start in Production Mode**:
    ```powershell
    npm start
    ```

---

## 7. Performance & Concurrency Controls

### Preventing Overbooking (Atomic Increments)
If multiple users book the same slot at the same millisecond, standard application checking (`if (count < 10) save()`) creates a race condition, leading to overbooking. 

We solve this using a **conditional atomic database update** in Mongoose:
```javascript
const updatedSlot = await Slot.findOneAndUpdate(
  {
    _id: slotId,
    bookedCount: { $lt: 10 } // Database checks capacity atomically
  },
  {
    $inc: { bookedCount: 1 } // Atomically increment
  },
  { new: true }
);
```
If `updatedSlot` returns `null`, the database atomically rejected the operation because it reached 10 bookings.

### Maintaining Data Consistency (MongoDB Transactions)
During a **Change Slot** request, we must decrease capacity from the old slot and increase it on the new slot. If the old slot is released, but the new slot fails to reserve (because it is full), the database becomes inconsistent.

We resolve this by wrapping the workflow in a **Mongoose Session Transaction**:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Release old slot count ($inc: -1)
  // Secure new slot count ($inc: +1)
  // Update Booking slotId
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Rolls back everything if any part fails
}
```

---

## 8. API Documentation & Example Requests

### **AUTH ENDPOINTS**

#### 1. User Registration
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/register`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "name": "John Doe",
      "phoneNumber": "9876543210",
      "age": 25,
      "pincode": "132001",
      "aadharNo": "123456789012",
      "password": "Password@123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "id": "6a8c6c5de15...",
        "name": "John Doe",
        "phoneNumber": "9876543210",
        "age": 25,
        "pincode": "132001",
        "aadharNo": "123456789012",
        "vaccinationStatus": "NONE"
      }
    }
    ```

#### 2. User Login
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "phoneNumber": "9876543210",
      "password": "Password@123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...",
        "user": {
          "id": "6a8c6c5de15...",
          "name": "John Doe",
          "phoneNumber": "9876543210",
          "vaccinationStatus": "NONE"
        }
      }
    }
    ```

#### 3. Admin Login
*   **Method**: `POST`
*   **Endpoint**: `/api/admin/auth/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "username": "admin",
      "password": "AdminPassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Admin login successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
      }
    }
    ```

---

### **USER SLOT & BOOKING ENDPOINTS**

#### 4. View Available Slots
*   **Method**: `GET`
*   **Endpoint**: `/api/slots?date=2024-11-01`
*   **Access**: Protected (Requires User Bearer Token)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Available slots retrieved successfully",
      "data": [
        {
          "id": "6a8c69031ad826d2c7fbe624",
          "date": "2024-11-01",
          "startTime": "10:00",
          "endTime": "10:30",
          "remainingCapacity": 10
        }
      ]
    }
    ```

#### 5. Book Vaccine Slot
*   **Method**: `POST`
*   **Endpoint**: `/api/bookings`
*   **Access**: Protected (Requires User Bearer Token)
*   **Request Body**:
    ```json
    {
      "slotId": "6a8c69031ad826d2c7fbe624",
      "doseNumber": 1
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Vaccination slot booked successfully",
      "data": {
        "bookingId": "6a8d227818761ba7e529c388",
        "doseNumber": 1,
        "status": "SCHEDULED",
        "slot": {
          "id": "6a8c69031ad826d2c7fbe624",
          "date": "2024-11-01",
          "startTime": "10:00",
          "endTime": "10:30"
        }
      }
    }
    ```

#### 6. Change Registered Slot
*   **Method**: `PUT`
*   **Endpoint**: `/api/bookings/:id/slot`
*   **Access**: Protected (Requires User Bearer Token)
*   **Request Body**:
    ```json
    {
      "newSlotId": "6a8c69031ad826d2c7fbe625"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Booking slot changed successfully",
      "data": {
        "bookingId": "6a8d227818761ba7e529c388",
        "doseNumber": 1,
        "status": "SCHEDULED",
        "slot": {
          "id": "6a8c69031ad826d2c7fbe625",
          "date": "2024-11-01",
          "startTime": "10:30",
          "endTime": "11:00"
        }
      }
    }
    ```

#### 7. View Personal Bookings
*   **Method**: `GET`
*   **Endpoint**: `/api/bookings/me`
*   **Access**: Protected (Requires User Bearer Token)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "My bookings retrieved successfully",
      "data": [
        {
          "bookingId": "6a8d227818761ba7e529c388",
          "doseNumber": 1,
          "status": "COMPLETED",
          "slot": {
            "id": "6a8c69031ad826d2c7fbe625",
            "date": "2024-11-01",
            "startTime": "10:30",
            "endTime": "11:00"
          }
        }
      ]
    }
    ```

---

### **ADMIN ENDPOINTS**

#### 8. Admin User List (with combined filters)
*   **Method**: `GET`
*   **Endpoint**: `/api/admin/users?age=25&pincode=132001&status=NONE`
*   **Access**: Protected (Requires Admin Bearer Token)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Registered users retrieved successfully",
      "data": {
        "totalMatchingUsers": 1,
        "users": [
          {
            "id": "6a8c6c5de15...",
            "name": "John Doe",
            "phoneNumber": "9876543210",
            "age": 25,
            "pincode": "132001",
            "aadharNo": "123456789012",
            "vaccinationStatus": "NONE"
          }
        ]
      }
    }
    ```

#### 9. Admin Slot Statistics
*   **Method**: `GET`
*   **Endpoint**: `/api/admin/slots/stats?date=2024-11-01`
*   **Access**: Protected (Requires Admin Bearer Token)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Slot statistics retrieved successfully",
      "data": {
        "date": "2024-11-01",
        "firstDoseRegistrations": 1,
        "secondDoseRegistrations": 1,
        "totalRegistrations": 2
      }
    }
    ```

---

## 9. Key Interview Questions & Answers

### 1. How did you prevent slot overbooking under heavy concurrent load?
We prevented race conditions by using **atomic conditional updates** directly in the database (`Slot.findOneAndUpdate` checking `bookedCount: { $lt: 10 }` and incrementing). This ensures Mongoose executes the operation as a single isolated command, rather than doing a separate find, check, and save, which would lead to dirty reads and overbooking.

### 2. Why are MongoDB Transactions necessary when changing user slots?
Because a slot modification involves multiple writes across different documents (releasing capacity on the old slot, securing capacity on the new slot, and updating the booking record). If the old slot is decremented but the new slot fails because it filled up, the database remains in an inconsistent state. A transaction guarantees that either **all** operations succeed, or they **all** roll back to preserve data integrity.

### 3. How does the system handle "automatic vaccination completion" without cron jobs?
We built **dynamic status evaluations** triggered upon key queries. Whenever a user views their bookings, checks their status, or attempts to make a booking (and when the admin pulls reports), the backend runs a helper that compares the current time with the slot ending times. If the slot has passed, it automatically marks the booking status as `COMPLETED` and recalculates the user's overall status (`FIRST_DOSE_COMPLETED` or `ALL_COMPLETED`) in real time.
