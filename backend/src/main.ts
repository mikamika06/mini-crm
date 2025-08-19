import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { config } from 'dotenv';
const cookieParser = require('cookie-parser'); 

config({ path: path.resolve(__dirname, '..', '.env') });

async function bootstrap() {
  try {
    console.log('Starting application...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('PORT:', process.env.PORT);

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      await prisma.$disconnect();
    } catch (error: any) {
      console.error('⚠️ Database connection warning:', error.message);
    }
    
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://wonderful-ocean-0c4b1ba1e.1.azurestaticapps.net',
        'https://mini-crm-frontend.azurewebsites.net'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
    console.log(` Application is running on port: ${port}`);
  } catch (error) {
    console.error(' Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
