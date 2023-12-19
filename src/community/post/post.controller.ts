import { Body, Controller, Get, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CreatePostDto, deletePostDto } from './dto/post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Post('create-post')
  createPost(@GetProfileId() profile_id: string, @Body() post: CreatePostDto) {
    return this.postService.createPost(profile_id, post);
  }
  @Post('delete-post')
  deletePost(
    @GetProfileId() profile_id: string,
    @Body() post_id: deletePostDto,
  ) {
    return this.postService.deletePost(profile_id, post_id);
  }

  @Get('get-user-post')
  getAllUserPost(@GetProfileId() profile_id: string) {
    return this.postService.getAllUserPost(profile_id);
  }
  @Get('like-post')
  likeUserPost(
    @GetProfileId() profile_id: string,
    @Body() post_id: deletePostDto,
  ) {
    return this.postService.likeUserPost(profile_id, post_id);
  }
  @Post('unlike-post')
  unlikeUserPost(
    @GetProfileId() profile_id: string,
    @Body() post_id: deletePostDto,
  ) {
    return this.postService.unlikeUserPost(profile_id, post_id);
  }
}
