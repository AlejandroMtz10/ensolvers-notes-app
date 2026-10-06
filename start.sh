#!/bin/bash
set -e

echo "=============================================="
echo " Starting Notes App"
echo "=============================================="

echo ""
echo "==> 1. Starting PostgreSQL..."
docker-compose up -d

echo "==> Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres -d notes_db > /dev/null 2>&1; do
    sleep 1
done

echo "PostgreSQL is ready."

echo ""
echo "==> 2. Building backend..."
cd backend

chmod +x mvnw
./mvnw clean package -DskipTests

echo "==> Starting backend..."
java -jar target/*.jar &
BACKEND_PID=$!

cd ..

echo ""
echo "==> 3. Installing frontend dependencies..."
cd frontend

if [ ! -d "node_modules" ]; then
    pnpm install
fi

echo "==> Starting frontend..."
pnpm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "=============================================="
echo " Application started successfully!"
echo ""
echo " Frontend: http://localhost:3000"
echo " Backend:  http://localhost:8080"
echo " Database: localhost:5432"
echo "=============================================="
echo ""
echo "Press Ctrl+C to stop the application."

cleanup() {
    echo ""
    echo "==> Stopping application..."

    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true

    docker-compose down

    echo "Application stopped."
}

trap cleanup INT TERM

wait