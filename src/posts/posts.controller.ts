import { Controller, Get } from '@nestjs/common';
import { Post } from 'src/posts/interfaces/post.interface';
import { PostsService } from 'src/posts/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  getAll(): Post[] {
    return this.postsService.getAll();
  }
}
