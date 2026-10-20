import { PostTag } from './postTag.model';
import { User } from './user.model';
import { Vote } from './vote.model';
import { Comment } from './comment.model';
export interface Post {
  id: number;
  title: string;
  text: string;
  pictureUrl: string;
  dateTime: Date;
  stopComments: boolean;
  status: 'Just_Posted' | 'First_Reactions' | 'Outdated';
  user: User;
  comments: Comment[];
  votes: Vote[];
  postTags: PostTag[];
}
