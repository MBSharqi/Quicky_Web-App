# Quicky

Local delivery web application — decoupled monolith with a Laravel API backend and a React (Vite) frontend.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React + Vite + Bootstrap + Axios    |
| Backend  | Laravel (API-only)                  |
| Database | MySQL via XAMPP (`delivery_qdb`)    |

## Prerequisites

- PHP 8.2+ and Composer
- Node.js 20+ and npm
- XAMPP with MySQL running

## One-time setup

### 1. Create the MySQL database

In phpMyAdmin or the MySQL CLI:

```sql
CREATE DATABASE delivery_qdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Confirm these values in `backend/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery_qdb
DB_USERNAME=root
DB_PASSWORD=
```

Then run migrations when ready:

```bash
php artisan migrate
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Run in development (two terminals)

### Terminal 1 — Laravel API (`http://127.0.0.1:8000`)

```bash
cd backend
php artisan serve
```

### Terminal 2 — Vite React app (`http://localhost:5173`)

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in the browser. The frontend Axios client targets `http://127.0.0.1:8000/api`.

## Project structure

```
Quicky/
├── backend/          Laravel API
│   ├── routes/api.php
│   └── ...
├── frontend/         React (Vite)
│   └── src/
│       ├── api/      Axios instance
│       ├── components/
│       ├── context/
│       └── pages/
└── README.md
```
