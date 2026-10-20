import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import type { Post } from '../../../models/post.model';
import type { Comment } from '../../../models/comment.model';
import type { User } from '../../../models/user.model';
import { CommentService } from '../../../services/comment.service';
import { VoteService } from '../../../services/vote.service';
import type { Vote } from '../../../models/vote.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnChanges, OnInit {
  @Input() post!: Post;
  @Input() set currentUser(value: User | null) {
    console.log('Setting current user:', value);
    this._currentUser = value;
  }
  get currentUser(): User | null {
    return this._currentUser;
  }
  private _currentUser: User | null = null;
  @Output() commentAdded = new EventEmitter<{
    postId: number;
    comment: Comment;
  }>();
  @Output() voted = new EventEmitter<{ postId: number; voteValue: number }>();
  @Output() openPostDetail = new EventEmitter<number>();

  postVoteCount = 0;

  Array = Array;

  showComments = false;
  newCommentText = '';
  isSubmittingComment = false;
  commentError = '';

  constructor(
    private commentService: CommentService,
    private voteService: VoteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ensure we have the current user
    if (!this.currentUser) {
      this.currentUser = this.authService.currentUserValue;
    }
  }

  showDetails() {
    this.router.navigate(['/posts', this.post.id]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post'] && this.post) {
      this.loadPostVoteCount();
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  submitComment(): void {
    if (!this.currentUser) {
      alert('You must be logged in to comment');
      return;
    }

    if (!this.newCommentText.trim()) {
      this.commentError = 'Comment cannot be empty';
      return;
    }

    this.isSubmittingComment = true;
    this.commentError = '';

    const newComment: Partial<Comment> = {
      text: this.newCommentText,
      dateTime: new Date(),
      pictureUrl: '',
      votes: [],
    };

    this.commentService
      .createComment(this.post.id, newComment as Comment)
      .subscribe({
        next: (comment) => {
          this.commentAdded.emit({ postId: this.post.id, comment });
          this.newCommentText = '';
          this.isSubmittingComment = false;
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.commentError = `Failed to add comment: ${error.message}`;
          this.isSubmittingComment = false;
        },
      });
  }

  private loadPostVoteCount(): void {
    if (!this.post) return;

    this.voteService.getVoteCountForPost(this.post.id).subscribe({
      next: (count) => {
        this.postVoteCount = count;
      },
      error: (error) => {
        console.error('Error loading post vote count:', error);
      },
    });
  }

  private updatePostVotes(vote: Vote): void {
    if (!this.post.votes) {
      this.post.votes = [];
    }
    const index = this.post.votes.findIndex(
      (v) => v.user?.id === this.currentUser?.id
    );
    if (index >= 0) {
      this.post.votes[index] = vote;
    } else {
      this.post.votes.push(vote);
    }
    this.loadPostVoteCount();
    this.voted.emit({ postId: this.post.id, voteValue: vote.vote_type });
  }

  upvotePost(): void {
    if (!this.currentUser || !this.post || !this.currentUser.id) {
      console.log('Cannot upvote: user, post, or user ID is missing.');
      return;
    }

    const userId = this.currentUser.id;
    const currentVote = this.post.votes?.find(v => v.user?.id === userId);

    console.log('PostItem - upvotePost:', { userId: userId, currentVote: currentVote, postVotes: this.post.votes });

    this.voteService.toggleVoteOnPost(this.post.id, userId, 1, currentVote as Vote | null).subscribe({
      next: (updatedVote) => {
        console.log('Upvote toggle successful:', updatedVote);
        // Update the local votes array based on the result
        if (updatedVote === null) { // Vote was removed
          if (this.post.votes) {
            this.post.votes = this.post.votes.filter(v => v.user?.id !== userId);
          }
        } else { // Vote was added or changed
          if (!this.post.votes) {
            this.post.votes = [];
          }
          const index = this.post.votes.findIndex(v => v.user?.id === userId);
          if (index >= 0) {
            this.post.votes[index] = updatedVote;
          } else {
            this.post.votes.push(updatedVote);
          }
        }
        this.loadPostVoteCount(); // Reload count to reflect change
      },
      error: (error) => {
        console.error('Error toggling upvote:', error);
        alert(`Failed to upvote post: ${error.message}`);
      }
    });
  }

  downvotePost(): void {
    if (!this.currentUser || !this.post || !this.currentUser.id) {
      console.log('Cannot downvote: user, post, or user ID is missing.');
      return;
    }

    const userId = this.currentUser.id;
    const currentVote = this.post.votes?.find(v => v.user?.id === userId);

    console.log('PostItem - downvotePost:', { userId: userId, currentVote: currentVote, postVotes: this.post.votes });

    this.voteService.toggleVoteOnPost(this.post.id, userId, -1, currentVote as Vote | null).subscribe({
      next: (updatedVote) => {
        console.log('Downvote toggle successful:', updatedVote);
        // Update the local votes array based on the result
        if (updatedVote === null) { // Vote was removed
          if (this.post.votes) {
            this.post.votes = this.post.votes.filter(v => v.user?.id !== userId);
          }
        } else { // Vote was added or changed
          if (!this.post.votes) {
            this.post.votes = [];
          }
          const index = this.post.votes.findIndex(v => v.user?.id === userId);
          if (index >= 0) {
            this.post.votes[index] = updatedVote;
          } else {
            this.post.votes.push(updatedVote);
          }
        }
        this.loadPostVoteCount(); // Reload count to reflect change
      },
      error: (error) => {
        console.error('Error toggling downvote:', error);
        alert(`Failed to downvote post: ${error.message}`);
      }
    });
  }

  hasUserVoted(): number {
    if (!this.currentUser || !this.post.votes) return 0;

    const userVote = this.post.votes.find(
      (vote) => vote.user?.id === this.currentUser?.id
    );
    return userVote ? userVote.vote_type : 0;
  }

  getVoteColor(voteType: number): string {
    if (!this.currentUser) return '#666666';
    
    const userVote = this.hasUserVoted();
    if (userVote === voteType) {
      return voteType === 1 ? '#4CAF50' : '#f44336';
    }
    return '#666666';
  }

  formatDate(date: Date): string {
    if (!date) return '';

    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error('Failed to load image:', imgElement.src);
  }
}
