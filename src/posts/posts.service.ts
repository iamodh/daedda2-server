import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from 'src/posts/interfaces/post.interface';

@Injectable()
export class PostsService {
  private posts: Post[] = [{ id: 1, title: 'post1', content: 'hello' }];

  getAll(): Post[] {
    return this.posts;
  }

  getOne(id: number): Post {
    const post = this.posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException(`Post with Id ${id} not found`);
    }

    return post;
  }
}
