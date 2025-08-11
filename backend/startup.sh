#!/bin/bash

echo "Starting Azure deployment process..."

export NODE_ENV=production

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installing dependencies..."
    npm ci --only=production
fi

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting the application..."
npm run start
