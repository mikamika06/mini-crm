
echo "Starting application..."
echo "Generating Prisma Client..."
npx prisma generate
echo "Running database migrations..."
npx prisma migrate deploy
echo "Starting NestJS application..."
npm run start:prod