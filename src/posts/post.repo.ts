import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(
    data: Omit<Prisma.PostCreateManyInput, 'authorId'>,
    authorId: string,
    tags?: string[],
  ): Promise<Post> {
    return this.prisma.post.create({
      data: {
        ttr: this.calculateTTR(data.content),
        author: { connect: { id: authorId } },
        ...data,
        comments: { create: [] },
        likes: { create: [] },
        views: { create: [] },
        bookmarks: { create: [] },
        reactions: { create: [] },
        tags: tags ? { connect: tags.map(tagId => ({ id: tagId })) } : undefined,
      },
    });
  }

  async updatePost(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        tags: true,
        comments: true,
        likes: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        author: true,
        tags: true,
      },
    });
  }

  async deletePost(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  private calculateTTR(content: string, wordsPerMinute = 200): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }
}
