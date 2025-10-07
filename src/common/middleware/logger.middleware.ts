import { Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      if (statusCode <= 300) {
        this.logger.log(`${method} ${url} ${statusCode} ${ip} ${duration}ms`);
      }
    });
    next();
  }
}
