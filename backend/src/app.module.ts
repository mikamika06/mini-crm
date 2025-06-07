import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module'; 
import { UserController } from './user.controller';
import { ClientModule } from './client/client.module';
@Module({
  imports: [AuthModule, ClientModule], 
   controllers: [UserController],
})
export class AppModule {}
