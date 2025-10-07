import { ConsoleLogger, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({
  providers: [
    {
      provide: LoggerService,
      useClass: process.env.NODE_ENV === 'production' ? ConsoleLogger : LoggerService,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
