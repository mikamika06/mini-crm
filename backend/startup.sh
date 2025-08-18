#!/bin/bash

echo "Starting application..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting NestJS application..."
node dist/main.js