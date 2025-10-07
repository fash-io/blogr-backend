import { Injectable } from '@nestjs/common';
import { FollowRepository } from './follow.repository';

@Injectable()
export class FollowService {
  constructor(private readonly followRepo: FollowRepository) {}

  async followUser(followerId: string, followingId: string) {
    return this.followRepo.followUser(followerId, followingId);
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.followRepo.unfollowUser(followerId, followingId);
  }

  async isFollowing(followerId: string, followingId: string) {
    return this.followRepo.isFollowing(followerId, followingId);
  }

  async getFollowers(userId: string) {
    return this.followRepo.getFollowers(userId);
  }

  async getFollowing(userId: string) {
    return this.followRepo.getFollowing(userId);
  }
}
