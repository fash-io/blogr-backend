import { Processor, WorkerHost } from '@nestjs/bullmq';
import axios from 'axios';
import FormData from 'form-data';
import { PostRepository } from './post.repo';
import { PostGateway } from './post.gateway';
import { ConfigService } from '@nestjs/config';

@Processor('post')
export class PostProcessor extends WorkerHost {
  constructor(
    private readonly repo: PostRepository,
    private readonly gateway: PostGateway,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: any) {
    const { postId, file, content } = job.data;

    let imageUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let excerpt: string | null = null;

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', Buffer.from(file.buffer.data), file.originalname);

        const imgRes = await axios.post(
          `${this.config.get<string>('IMAGE_UPLOAD_URL')}/upload-image?postId=${postId}`,
          formData,
          { headers: formData.getHeaders() },
        );

        imageUrl = imgRes.data.imageUrl;
        thumbnailUrl = imgRes.data.thumbnailUrl;
      }

      try {
        const summaryRes = await axios.post(
          `${this.config.get<string>('SUMMARIZER_URL')}/summarize`,
          {
            text: content,
          },
        );
        excerpt = summaryRes.data.summary;
      } catch {
        excerpt = content.slice(0, 200);
      }

      await this.repo.updatePost(postId, {
        image: imageUrl,
        thumbnail: thumbnailUrl,
        excerpt,
      });

      this.gateway.notifyPostProcessed(postId);

      return { status: 'done', postId };
    } catch (err) {
      console.error('Post processing failed:', err.message);
      throw err;
    }
  }
}
