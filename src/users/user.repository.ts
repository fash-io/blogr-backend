import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data: { ...data, profile: { create: {} } } });
  }

  findByEmail(email: string, select?: Prisma.UserSelect) {
    if (select) return this.db.user.findUnique({ where: { email }, select });
    return this.db.user.findUnique({ where: { email } });
  }

  findByUsername(username: string, select?: Prisma.UserSelect) {
    if (select) return this.db.user.findUnique({ where: { username }, select });
    return this.db.user.findUnique({ where: { username } });
  }

  findByEmailOrUsername(emailOrUsername: string, select?: Prisma.UserSelect) {
    if (select)
      return this.db.user.findMany({
        where: {
          OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
        select,
      });
    return this.db.user.findMany({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  findById(id: string, select: Prisma.UserSelect) {
    if (select) return this.db.user.findUnique({ where: { id }, select });
    return this.db.user.findUnique({ where: { id } });
  }

  findAll(select?: Prisma.UserSelect) {
    return this.db.user.findMany({ select });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.db.user.delete({ where: { id } });
  }

  countPosts(userId: string) {
    return this.db.post.count({ where: { authorId: userId } });
  }

  countComments(userId: string) {
    return this.db.comment.count({ where: { authorId: userId } });
  }

  countLikesGiven(userId: string) {
    return this.db.like.count({ where: { userId } });
  }

  countLikesOnPost(postId: string) {
    return this.db.like.count({ where: { postId } });
  }
}
