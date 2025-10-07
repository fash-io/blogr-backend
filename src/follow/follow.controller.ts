import { Controller, Post } from '@nestjs/common';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/follow/:followingId')
  async followUser(followerId: string, followingId: string) {
    return this.followService.followUser(followerId, followingId);
  }

  @Post('/unfollow/:followingId')
  async unfollowUser(followerId: string, followingId: string) {
    return this.followService.unfollowUser(followerId, followingId);
  }

  @Post('/isFollowing/:followingId')
  async isFollowing(followerId: string, followingId: string) {
    return this.followService.isFollowing(followerId, followingId);
  }

  @Post('/followers/:userId')
  async getFollowers(userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Post('/following/:userId')
  async getFollowing(userId: string) {
    return this.followService.getFollowing(userId);
  }
}
