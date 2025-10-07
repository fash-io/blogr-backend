import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowRepository {
  constructor(private readonly db: PrismaService) {}

  async followUser(followerId: string, followingId: string) {
    return this.db.follow.create({
      data: { followerId, followingId },
    });
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.db.follow.deleteMany({
      where: { followerId, followingId },
    });
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getFollowers(userId: string) {
    return this.db.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
  }

  async getFollowing(userId: string) {
    return this.db.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
  }


}
