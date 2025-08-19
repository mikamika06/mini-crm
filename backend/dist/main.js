"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const cookieParser = require('cookie-parser');
(0, dotenv_1.config)({ path: path.resolve(__dirname, '..', '.env') });
async function bootstrap() {
    try {
        console.log('Starting application...');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('PORT:', process.env.PORT);
        // Перевірка Prisma Client
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.$connect();
            console.log('✅ Database connected successfully');
            await prisma.$disconnect();
        }
        catch (error) {
            console.error('⚠️ Database connection warning:', error.message);
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use(cookieParser());
        app.useGlobalPipes(new common_1.ValidationPipe());
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
    }
    catch (error) {
        console.error(' Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
