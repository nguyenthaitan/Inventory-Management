# Inventory Management System - Source Code

This directory contains the source code for the Inventory Management System, divided into:
- **backend**: NestJS application (API).
- **frontend**: React + Vite application (UI).
- **infra**: Infrastructure configuration (Docker, etc.).
- **database**: Database initialization scripts.

## Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

---

## 🚀 Quick Start (Backend + Database with Docker)

Iif you want to run the Backend and Database quickly using Docker:

1. **Start the services:**
   ```bash
   docker-compose up --build -d
   ```
   This will start:
   - **MongoDB**: `localhost:27017`
   - **Backend API**: `http://localhost:3000`

2. **Verify installation:**
   - Check if backend is running: Visit `http://localhost:3000`

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

---

## 🛠 Manual Setup (Frontend + Backend + Database)

For development, often it is better to run the frontend and backend locally while keeping the database in Docker.

### 1. Start the Database
Use the dedicated mongo compose file to start only the database:
```bash
docker-compose -f docker-compose-mongo.yml up -d
```
*Credentials:*
- **Username**: `admin`
- **Password**: `password123`
- **Connection String**: `mongodb://admin:password123@localhost:27017/inventory_db?authSource=admin`

### 2. Setup & Run Backend

Open a new terminal:
```bash
cd backend

# Install dependencies
npm install

# Run in development mode
npm run start:dev
```
The backend will start at `http://localhost:3000`.

### 3. Setup & Run Frontend

Open a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run dev
```
The frontend will start at `http://localhost:5173` (or the port shown in terminal).

---

## 📂 Project Structure

```
01_Source Code/
├── backend/                # NestJS Backend source
│   ├── src/                # Application logic
│   └── test/               # E2E tests
├── frontend/               # React Frontend source
│   ├── src/                # UI Components & Logic
│   └── public/             # Static assets
├── infra/                  # Dockerfiles & Nginx config
├── database/               # Database initialization scripts
├── docker-compose.yml      # Main compose file (BE + Mongo)
└── docker-compose-mongo.yml # Database only compose file
```

## ⚠️ Common Issues

- **Port Conflicts**: Ensure ports `3000` (Backend), `5173` (Frontend), and `27017` (Mongo) are free.
- **MongoDB Connection**: If the backend fails to connect, ensure the MongoDB container is running and the credentials in `.env` (or default in code) match the docker-compose values.
