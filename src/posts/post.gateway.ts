import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
@Injectable()
export class PostGateway {
  @WebSocketServer()
  server: Server;

  // emit event when a post has been processed
  notifyPostProcessed(postId: string) {
    this.server.emit('postProcessed', { postId });
  }
}
