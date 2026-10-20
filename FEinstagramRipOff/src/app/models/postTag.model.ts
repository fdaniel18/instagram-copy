import { Post } from "./post.model"
import { Tag } from "./tag.model"


export interface PostTag{
    id:number
    post?: Post
    tag: Tag
}