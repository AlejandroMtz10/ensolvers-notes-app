#!/bin/bash
set -e

echo "==> 1. Start database with PostgreSQL & Docker ..."
docker-compose up -d

echo "==> 2. Compiling and starting the backend (Spring Boot)..."
cd backend
# Ensure you have permissions for the maven wrapper or use mvn directly
./mvnw clean package -DskipTests
java -jar target/*.jar &
BACKEND_PID=$!
cd ..

echo "==> 3. Compiling and starting the frontend (Next.js)..."
cd frontend
if [ ! -d "node_modules" ]; then
    pnpm install
fi
pnpm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================================"
echo "Application started successfully!"
echo "Backend running at: http://localhost:8080"
echo "Frontend running at: http://localhost:3000"
echo "======================================================"

# Maintain the script alive and handle clean shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT TERM
wait