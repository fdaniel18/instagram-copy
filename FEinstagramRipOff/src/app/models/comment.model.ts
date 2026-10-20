import { User } from "./user.model"
import { Post } from "./post.model"
import { Vote } from "./vote.model"

export interface Comment {
  id: number
  text: string
  dateTime: Date
  pictureUrl: string
  post: Post
  user: User
  votes: Vote[]
}