import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PostsService } from '../../posts/posts.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.id;

    const post = await this.postsService.findOne(postId);

    if (!post || post.authorId !== user.id || user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only modify your own posts');
    }

    return true;
  }
}
