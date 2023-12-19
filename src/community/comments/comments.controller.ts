import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetProfileId } from 'src/shared/decorators/get-profile-id.decorator';
import { CommentDto, deleteCommentDto, getCommentDto } from './dto/post.dto';
import { CommentsService } from './comments.service';
import { ProfileGuard } from 'src/shared/guards';

@UseGuards(ProfileGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post('add-comments')
  addComment(@GetProfileId() profile_id: string, @Body() dto: CommentDto) {
    return this.commentService.addComment(dto, profile_id);
  }

  @Post('get-comments')
  getComments(@GetProfileId() profile_id: string, @Body() dto: getCommentDto) {
    return this.commentService.getComments(dto, profile_id);
  }

  @Post('delete-comments')
  deleteComments(
    @GetProfileId() profile_id: string,
    @Body() dto: deleteCommentDto,
  ) {
    return this.commentService.deleteComments(dto, profile_id);
  }

  @Get('like-comments/:id')
  likeComment(@GetProfileId() profile_id: string, @Param() id: string) {
    return this.commentService.likeComment(profile_id, id);
  }

  @Get('unlike-comments/:id')
  unLikeComment(@GetProfileId() profile_id: string, @Param() id: string) {
    return this.commentService.unLikeComment(profile_id, id);
  }
  
}
