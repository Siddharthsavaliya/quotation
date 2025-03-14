# User Management API

A Node.js Express API for user management with JWT authentication and role-based access control.

## Features

- User authentication using JWT
- Role-based access control (Admin and User roles)
- CRUD operations for users
- Password encryption
- MongoDB database
- Input validation
- Standardized API responses

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/user_management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Public Routes

- POST /api/users/login - Login user

### Protected Routes (Requires Authentication)

- GET /api/users/profile - Get user profile
- PATCH /api/users/profile - Update user profile

### Admin Only Routes

- POST /api/users - Create new user
- GET /api/users - Get all users
- PATCH /api/users/:id - Update user by ID
- DELETE /api/users/:id - Delete user by ID

## Default Admin Credentials

```
email: admin@example.com
password: admin123
```

## Response Format

All API responses follow this format:

```json
{
    "status": boolean,
    "message": string,
    "data": object
}
```
