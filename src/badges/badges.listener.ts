import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BadgesListener {
  @OnEvent('user.created')
  handleUserCreated() {
    console.log('User created');
  }
}
