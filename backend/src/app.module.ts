import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module'; // 👈 додай цей імпорт
import { UserController } from './user.controller';
@Module({
  imports: [AuthModule], 
   controllers: [UserController],
})
export class AppModule {}
