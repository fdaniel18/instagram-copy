import { Component, type OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { AuthService } from '../../../services/auth.service';
import { VoteService } from '../../../services/vote.service';
import { TagService } from '../../../services/tag.service';
import type { Post } from '../../../models/post.model';
import type { Comment } from '../../../models/comment.model';
import type { User } from '../../../models/user.model';
import type { Tag } from '../../../models/tag.model';
import { HeaderComponent } from '../../header/header.component';
import { PostItemComponent } from '../post-item/post-item.component';
import { CreatePostComponent } from '../create-post/create-post.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    PostItemComponent,
    CreatePostComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;
  private postsSubscription: Subscription | null = null;
  isCreatingPost = false;
  tags: Tag[] = [];
  selectedTag: number | null = null;
  searchTerm = '';
  searchType = 'title';
  loading = {
    posts: false,
    tags: false,
  };
  error = {
    posts: '',
    tags: '',
  };

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private voteService: VoteService,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  selectedPostId: number | null = null;

  onOpenPostDetail(id: number) {
    this.selectedPostId = id;
  }
  closeModal() {
    this.selectedPostId = null;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.loadPosts();
    this.loadTags();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
  }

  loadPosts(): void {
    this.loading.posts = true;
    this.error.posts = '';

    this.postsSubscription = this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.loading.posts = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.error.posts = `Failed to load posts: ${error.message}`;
        this.loading.posts = false;
      },
    });
  }

  loadPostComments(post: Post): void {
    this.postService.getPostComments(post.id).subscribe({
      next: (comments) => {
        post.comments = comments;
      },
      error: (error) => {
        console.error(`Error loading comments for post ${post.id}:`, error);
      },
    });
  }

  loadTags(): void {
    this.loading.tags = true;
    this.error.tags = '';

    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.loading.tags = false;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.error.tags = `Failed to load tags: ${error.message}`;
        this.loading.tags = false;
      },
    });
  }

  filterByTag(tagId: number | null): void {
    this.selectedTag = tagId;
    if (tagId === null) {
      this.loadPosts(); // Reset to all posts
    } else {
      this.loading.posts = true;
      this.error.posts = '';

      this.tagService
        .getPostsByTag(tagId)
        .pipe(finalize(() => (this.loading.posts = false)))
        .subscribe({
          next: (posts) => {
            this.posts = posts;
            this.filteredPosts = posts;
            // Load comments for each post
            this.posts.forEach((post) => this.loadPostComments(post));
          },
          error: (error) => {
            console.error(`Error loading posts for tag ${tagId}:`, error);
            this.error.posts = `Failed to load posts for selected tag: ${error.message}`;
          },
        });
    }
  }

  onSearch(event: { term: string; type: string }): void {
    this.searchTerm = event.term;
    this.searchType = event.type;
    this.filterPosts();
  }

  filterPosts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPosts = this.posts;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    
    switch (this.searchType) {
      case 'title':
        this.filteredPosts = this.posts.filter(post => 
          post.title.toLowerCase().includes(term)
        );
        break;
      case 'user':
        this.filteredPosts = this.posts.filter(post => 
          post.user?.username?.toLowerCase().includes(term)
        );
        break;
      case 'tag':
        this.filteredPosts = this.posts.filter(post => 
          post.postTags?.some(pt => 
            pt.tag?.name?.toLowerCase().includes(term)
          )
        );
        break;
      default:
        this.filteredPosts = this.posts;
    }
  }

  toggleCreatePost(): void {
    console.log('Toggling create post:', !this.isCreatingPost);
    this.isCreatingPost = !this.isCreatingPost;
  }

  onPostCreated(post: Post): void {
    this.posts.unshift(post);
    this.filteredPosts = this.posts;
    this.isCreatingPost = false;
  }

  onCommentAdded(event: { postId: number; comment: Comment }): void {
    const post = this.posts.find((p) => p.id === event.postId);
    if (post) {
      if (!post.comments) {
        post.comments = [];
      }
      post.comments.push(event.comment);
    }
  }

  onVote(event: { postId: number; voteValue: number }): void {
    const post = this.posts.find((p) => p.id === event.postId);
    if (post) {
      // Update the post's vote count
      this.postService.getPostDetail(event.postId).subscribe({
        next: (updatedPost) => {
          const index = this.posts.findIndex((p) => p.id === event.postId);
          if (index !== -1) {
            this.posts[index] = updatedPost;
            this.filteredPosts = this.posts;
          }
        },
        error: (error) => {
          console.error('Error updating post votes:', error);
        },
      });
    }
  }
}
