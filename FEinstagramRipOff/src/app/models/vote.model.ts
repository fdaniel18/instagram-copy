import type { User } from "./user.model"
import type { Post } from "./post.model"
import type { Comment } from "./comment.model"

export interface Vote {
  id: number
  vote_type: number // -1 for downvote, +1 for upvote
  user: User | null
  post: Post | null
  comment: Comment | null
}
