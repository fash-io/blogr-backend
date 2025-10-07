import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (typeof data == 'object' && data.returnMessageBlogr) {
          const { returnMessageBlogr, ...result } = data;

          return { success: true, data: result, message: returnMessageBlogr };
        }
        return { success: true, data: data };
      }),
    );
  }
}
