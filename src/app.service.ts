import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { returnMessageBlogr: 'Hello World!' };
  }
}
