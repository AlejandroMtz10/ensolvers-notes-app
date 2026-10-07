# Notes App

A full-stack note management application developed for the
Ensolvers Full Stack Implementation Exercise.

## Features

### Phase 1
- Create notes
- Edit notes
- Delete notes
- Archive notes
- Unarchive notes
- List active notes
- List archived notes

### Phase 2
- Create categories
- Assign categories to notes
- Remove/change categories
- Filter notes by category

## Technologies

### Backend
- Java ...
- Spring Boot ...
- Spring Data JPA
- Spring Security
- Maven ...
- PostgreSQL 15

### Frontend
- Next.js ...
- React ...
- TypeScript ...
- pnpm ...

### Infrastructure
- Docker
- Docker Compose
- PostgreSQL 15

## Architecture

backend/
frontend/

The backend follows a layered architecture:

Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL

## Requirements

- Java ...
- Node.js ...
- pnpm ...
- Docker ...
- Docker Compose ...

## Running the application

Clone the repository:

git clone <repository-url>

Enter the project directory:

cd <project-directory>

Make the startup script executable:

chmod +x start.sh

Start the application:

./start.sh

The application will be available at:

Frontend: http://localhost:3000
Backend: http://localhost:8080

## Database

PostgreSQL runs using Docker Compose.

Database:
notes_db

Username:
postgres

Password:
postgres

Port:
5432

## Authentication

The application uses HTTP Basic Authentication.