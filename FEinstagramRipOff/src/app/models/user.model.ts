import { Post } from './post.model';
import { Vote } from './vote.model';
import { Comment } from './comment.model';

export interface User {
  id: number;
  username: string;
  isBanned: boolean;
  banned?: boolean;
  email: string;
  phone_number: string;
  score: number;
  role: 'USER' | 'ADMIN';
  posts: Post[];
  comments: Comment[];
  votes: Vote[];
  postCount?: number;
  commentCount?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}
