import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import axios from 'axios';
import FormData from 'form-data';
import { Request } from 'express';

@Injectable()
export class ImageUploadInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const file = request.file;

    if (
      !file ||
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) ||
      !request.url.startsWith('/users')
    ) {
      return next.handle();
    }

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    const response: Record<string, string> = await axios.post(
      'http://localhost:8000/upload-image',
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (request.url.startsWith('/users')) request.body.avatar = response.imageUrl;

    return next.handle();
  }
}
