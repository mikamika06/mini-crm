const { execSync } = require('child_process');
const path = require('path');

console.log('Starting backend application...');

try {
  // Перевіряємо чи існує Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generated successfully');
} catch (error) {
  console.error('Warning: Prisma generation failed:', error.message);
}

try {
  // Запускаємо основний додаток
  console.log('Starting NestJS application...');
  require('./dist/main.js');
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}
