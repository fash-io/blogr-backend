import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class PostQueue {
  constructor(@InjectQueue('post') private readonly postQueue: Queue) {}

  async addProcessJobs(postId: string, file: Express.Multer.File, content: string) {
    await this.postQueue.add('processPost', {
      postId,
      file,
      content,
    });
  }
}
