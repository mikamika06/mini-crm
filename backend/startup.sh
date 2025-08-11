#!/bin/bash

echo "Starting Azure deployment process..."

export NODE_ENV=production

echo "Installing dependencies..."
npm ci --only=production

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
npm run start
