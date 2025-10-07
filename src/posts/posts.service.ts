import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PostRepository } from './post.repo';
import { PostQueue } from './post.queue';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostRepository,
    private readonly postQueue: PostQueue,
  ) {}

  async create(createPostDto: any, file: Express.Multer.File, authorId: string): Promise<Post> {
    const post = await this.repo.createPost(createPostDto, authorId);
    await this.postQueue.addProcessJobs(post.id, file, post.content);

    return post;
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }) {
    return this.repo.findAll(params);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, updatePostDto: Partial<Post>) {
    return this.repo.updatePost(id, updatePostDto);
  }

  remove(id: string) {
    return this.repo.deletePost(id);
  }
}
