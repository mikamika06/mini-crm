import { Module } from '@nestjs/common';
import { ErrorHandlingModule } from './error-handling/error-handling.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [ErrorHandlingModule, LoggingModule],
  exports: [ErrorHandlingModule, LoggingModule],
})
export class SharedModule {}