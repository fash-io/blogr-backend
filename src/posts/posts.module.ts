import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostRepository } from './post.repo';
import { PostQueue } from './post.queue';
import { PostProcessor } from './post.processor';
import { PostGateway } from './post.gateway';

@Module({
  imports: [BullModule.registerQueue({ name: 'post' })],
  controllers: [PostsController],
  providers: [PostsService, PostRepository, PostQueue, PostProcessor, PostGateway],
})
export class PostsModule {}
