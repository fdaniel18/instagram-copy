import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { CommentService } from '../../../services/comment.service';
import { VoteService } from '../../../services/vote.service';
import { TagService } from '../../../services/tag.service';
import { Post } from '../../../models/post.model';
import { Comment } from '../../../models/comment.model';
import { User } from '../../../models/user.model';
import { Tag } from '../../../models/tag.model';
import { Vote } from '../../../models/vote.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  @Input() postId!: number;
  post: Post | null = null;
  currentUser: User | null = null;
  isEditing = false;
  editedPost: Partial<Post> = {};
  availableTags: Tag[] = [];
  selectedTags: number[] = [];
  newCommentText = '';
  newCommentImageUrl = '';
  isSubmittingComment = false;
  commentError = '';
  loading = true;
  error = '';
  postVoteCount = 0;
  showCommentForm = false;
  showComments = true;
  Array = Array; // Make Array available to the template
  editingCommentId: number | null = null;
  editedCommentText = '';
  editedCommentImageUrl = '';
  isSubmittingCommentEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private commentService: CommentService,
    private voteService: VoteService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadPost();
    this.loadTags();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['postId'] && this.postId) {
      this.loadPost();
    }
  }

  loadPost(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid post ID';
      this.loading = false;
      return;
    }

    this.postService.getPostDetail(id).subscribe({
      next: (post) => {
        this.post = post;
        // Fetch comments using CommentService
        this.commentService.getCommentsForPost(id).subscribe({
          next: (comments) => {
            if (this.post) {
              this.post.comments = comments;
            }
            this.loading = false;
            this.loadPostVoteCount();
          },
          error: (error) => {
            console.error('Error loading comments:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = `Failed to load post: ${error.message}`;
        this.loading = false;
      },
    });
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      },
    });
  }

  submitComment(): void {
    if (!this.currentUser) {
      this.commentError = 'You must be logged in to comment';
      return;
    }

    if (!this.post) {
      return;
    }

    if (this.post.stopComments) {
      this.commentError = 'Comments are disabled for this post';
      return;
    }

    if (!this.newCommentText.trim()) {
      this.commentError = 'Comment cannot be empty';
      return;
    }

    this.isSubmittingComment = true;
    this.commentError = '';

    const commentToCreate = {
      text: this.newCommentText,
      pictureUrl: this.newCommentImageUrl || '',
      dateTime: new Date(),
      user: {
        id: this.currentUser.id
      },
      post: {
        id: this.post.id
      }
    };

    this.commentService
      .createComment(this.post.id, commentToCreate as Comment)
      .subscribe({
        next: (comment) => {
          if (this.post && this.post.comments) {
            this.post.comments.unshift(comment);
          }
          this.newCommentText = '';
          this.newCommentImageUrl = '';
          this.isSubmittingComment = false;
          this.showCommentForm = false;
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.commentError = `Failed to add comment: ${error.message}`;
          this.isSubmittingComment = false;
        },
      });
  }

  cancelComment(): void {
    this.newCommentText = '';
    this.newCommentImageUrl = '';
    this.commentError = '';
    this.showCommentForm = false;
  }

  private updatePostVotes(vote: Vote): void {
    if (!this.post) return;
    
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
  }

  getVoteCount(votes: Vote[]): number {
    if (!votes || votes.length === 0) return 0;
    return votes.reduce((total, vote) => total + (vote.vote_type || 0), 0);
  }

  hasUserVoted(votes: Vote[]): number {
    if (!this.currentUser || !votes) return 0;
    const userVote = votes.find((vote) => vote.user?.id === this.currentUser?.id);
    return userVote ? userVote.vote_type : 0;
  }

  canUserVoteOnPost(): boolean {
    if (!this.currentUser || !this.post) return false;

    return this.post.user.id !== this.currentUser.id;
  }

  canUserVoteOnComment(comment: Comment): boolean {
    if (!this.currentUser || !comment?.user) return false;
    return comment.user.id !== this.currentUser.id;
  }

  canToggleComments(): boolean {
    return !!(
      this.currentUser &&
      this.post &&
      this.currentUser.id === this.post.user.id
    );
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
    imgElement.src = 'assets/images/placeholder.png'; // You can set a default image here
  }

  toggleComments(): void {
    if (!this.post || !this.currentUser) return;
    
    // Only allow post owner or admin to toggle comments
    if (this.currentUser.id !== this.post.user.id && this.currentUser.role !== 'ADMIN') return;

    const newState = !this.post.stopComments;
    
    this.postService.togglePostComments(this.post.id, newState).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
        window.location.reload();
      },
      error: (error) => {
        console.error('Error toggling comments:', error);
        alert('Failed to toggle comments. Please try again.');
        // Revert the state if the API call fails
        this.post!.stopComments = !newState;
      }
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

  upvotePost(): void {
    if (!this.currentUser || !this.post) {
      console.log('No current user or post available');
      return;
    }

    if (!this.currentUser.id) {
      console.error('Current user ID is undefined');
      return;
    }

    const currentVote = this.post.votes?.find(v => v.user?.id === this.currentUser?.id);
    const userId = this.currentUser.id;
    
    console.log('Current user:', this.currentUser);
    console.log('User ID:', userId);
    console.log('Current vote:', currentVote);
    
    // If user already upvoted, remove the vote
    if (currentVote?.vote_type === 1) {
      console.log('Deleting vote with ID:', currentVote.id);
      this.voteService.deleteVote(currentVote.id).subscribe({
        next: () => {
          console.log('Vote deleted successfully');
          // Remove the vote from the local state
          if (this.post!.votes) {
            this.post!.votes = this.post!.votes.filter(v => v.user?.id !== userId);
          }
          this.loadPostVoteCount();
        },
        error: (error) => {
          console.error('Error removing vote:', error);
          alert(`Failed to remove vote: ${error.message}`);
        }
      });
      return;
    }

    // If user downvoted, update to upvote
    if (currentVote?.vote_type === -1) {
      console.log('Deleting downvote with ID:', currentVote.id);
      this.voteService.deleteVote(currentVote.id).subscribe({
        next: () => {
          console.log('Downvote deleted successfully, adding upvote');
          // After deleting the downvote, add the upvote
          this.voteService.voteOnPost(this.post!.id, userId, 1).subscribe({
            next: (vote) => {
              this.updatePostVotes(vote);
            },
            error: (error) => {
              console.error('Error upvoting post:', error);
              alert(`Failed to upvote: ${error.message}`);
            }
          });
        },
        error: (error) => {
          console.error('Error removing downvote:', error);
          alert(`Failed to remove downvote: ${error.message}`);
        }
      });
      return;
    }

    // If no vote exists, add upvote
    console.log('Adding new upvote for user:', userId);
    this.voteService.voteOnPost(this.post!.id, userId, 1).subscribe({
      next: (vote) => {
        this.updatePostVotes(vote);
      },
      error: (error) => {
        console.error('Error upvoting post:', error);
        alert(`Failed to upvote: ${error.message}`);
      }
    });
  }

  downvotePost(): void {
    if (!this.currentUser || !this.post) {
      console.log('No current user or post available');
      return;
    }

    if (!this.currentUser.id) {
      console.error('Current user ID is undefined');
      return;
    }

    const currentVote = this.post.votes?.find(v => v.user?.id === this.currentUser?.id);
    const userId = this.currentUser.id;
    
    console.log('Current user:', this.currentUser);
    console.log('User ID:', userId);
    console.log('Current vote:', currentVote);
    
    // If user already downvoted, remove the vote
    if (currentVote?.vote_type === -1) {
      console.log('Deleting vote with ID:', currentVote.id);
      this.voteService.deleteVote(currentVote.id).subscribe({
        next: () => {
          console.log('Vote deleted successfully');
          // Remove the vote from the local state
          if (this.post!.votes) {
            this.post!.votes = this.post!.votes.filter(v => v.user?.id !== userId);
          }
          this.loadPostVoteCount();
        },
        error: (error) => {
          console.error('Error removing vote:', error);
          alert(`Failed to remove vote: ${error.message}`);
        }
      });
      return;
    }

    // If user upvoted, update to downvote
    if (currentVote?.vote_type === 1) {
      console.log('Deleting upvote with ID:', currentVote.id);
      this.voteService.deleteVote(currentVote.id).subscribe({
        next: () => {
          console.log('Upvote deleted successfully, adding downvote');
          // After deleting the upvote, add the downvote
          this.voteService.voteOnPost(this.post!.id, userId, -1).subscribe({
            next: (vote) => {
              this.updatePostVotes(vote);
            },
            error: (error) => {
              console.error('Error downvoting post:', error);
              alert(`Failed to downvote: ${error.message}`);
            }
          });
        },
        error: (error) => {
          console.error('Error removing upvote:', error);
          alert(`Failed to remove upvote: ${error.message}`);
        }
      });
      return;
    }

    // If no vote exists, add downvote
    console.log('Adding new downvote for user:', userId);
    this.voteService.voteOnPost(this.post!.id, userId, -1).subscribe({
      next: (vote) => {
        this.updatePostVotes(vote);
      },
      error: (error) => {
        console.error('Error downvoting post:', error);
        alert(`Failed to downvote: ${error.message}`);
      }
    });
  }

  getVoteColor(voteType: number): string {
    if (!this.currentUser) return '#666666';
    
    const userVote = this.hasUserVoted(this.post?.votes || []);
    if (userVote === voteType) {
      return voteType === 1 ? '#4CAF50' : '#f44336';
    }
    return '#666666';
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  canEditPost(): boolean {
    if (!this.currentUser) return false;
    return (
      this.currentUser.role === 'ADMIN' ||
      this.post?.user?.id === this.currentUser.id
    );
  }

  startEditing(): void {
    if (!this.post) return;
    
    this.editedPost = { ...this.post };
    this.selectedTags = this.post.postTags.map(pt => pt.tag.id);
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedPost = {};
    this.selectedTags = [];
  }

  saveChanges(): void {
    if (!this.editedPost.title?.trim() || !this.editedPost.text?.trim()) {
      alert('Title and content are required');
      return;
    }

    const postToUpdate = {
      ...this.editedPost,
      postTags: this.selectedTags.map(tagId => ({
        tag: { id: tagId }
      }))
    };

    this.postService.updatePost(postToUpdate as Post).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
        this.isEditing = false;
        this.editedPost = {};
        this.selectedTags = [];
      },
      error: (error) => {
        console.error('Error updating post:', error);
        alert(`Failed to update post: ${error.message}`);
      },
    });
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTags.includes(tagId);
  }

  toggleTag(tagId: number): void {
    const index = this.selectedTags.indexOf(tagId);
    if (index === -1) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  deletePost(): void {
    if (!this.post) return;
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          // Successfully deleted
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          // Only show error if it's not a successful deletion
          if (error.status !== 200) {
            alert('Failed to delete post. Please try again.');
          } else {
            // If we got a 200 status but with parsing error, consider it a success
            this.router.navigate(['/posts']);
          }
        },
        complete: () => {
          // Ensure navigation happens even if there's no response
          this.router.navigate(['/posts']);
        }
      });
    }
  }

  toggleCommentsSection(): void {
    this.showComments = !this.showComments;
  }

  upvoteComment(comment: Comment): void {
    if (!this.currentUser || !comment.id || !this.currentUser.id) {
      console.log('Cannot upvote comment: user, comment ID, or user ID is missing.');
      return;
    }

    const userId = this.currentUser.id;
    // Find the current vote for this user on this specific comment
    const currentVote = comment.votes?.find(v => v.user?.id === userId);

    this.voteService.toggleVoteOnComment(comment.id, userId, 1, currentVote as Vote | null).subscribe({
      next: (updatedVote) => {
        console.log('Comment upvote toggle successful:', updatedVote);
        // Update the local votes array for the specific comment
        if (updatedVote === null) { // Vote was removed
          if (comment.votes) {
            comment.votes = comment.votes.filter(v => v.user?.id !== userId);
          }
        } else { // Vote was added or changed
          if (!comment.votes) {
            comment.votes = [];
          }
          const index = comment.votes.findIndex(v => v.user?.id === userId);
          if (index >= 0) {
            comment.votes[index] = updatedVote;
          } else {
            comment.votes.push(updatedVote);
          }
        }
        // The getVoteCount pipe in the template will automatically update the displayed count
      },
      error: (error) => {
        console.error('Error toggling comment upvote:', error);
        alert(`Failed to upvote comment: ${error.message}`);
      }
    });
  }

  downvoteComment(comment: Comment): void {
    if (!this.currentUser || !comment.id || !this.currentUser.id) {
      console.log('Cannot downvote comment: user, comment ID, or user ID is missing.');
      return;
    }

    const userId = this.currentUser.id;
    // Find the current vote for this user on this specific comment
    const currentVote = comment.votes?.find(v => v.user?.id === userId);

    this.voteService.toggleVoteOnComment(comment.id, userId, -1, currentVote as Vote | null).subscribe({
      next: (updatedVote) => {
        console.log('Comment downvote toggle successful:', updatedVote);
        // Update the local votes array for the specific comment
        if (updatedVote === null) { // Vote was removed
          if (comment.votes) {
            comment.votes = comment.votes.filter(v => v.user?.id !== userId);
          }
        } else { // Vote was added or changed
          if (!comment.votes) {
            comment.votes = [];
          }
          const index = comment.votes.findIndex(v => v.user?.id === userId);
          if (index >= 0) {
            comment.votes[index] = updatedVote;
          } else {
            comment.votes.push(updatedVote);
          }
        }
        // The getVoteCount pipe in the template will automatically update the displayed count
      },
      error: (error) => {
        console.error('Error toggling comment downvote:', error);
        alert(`Failed to downvote comment: ${error.message}`);
      }
    });
  }

  canDeleteComment(comment: Comment): boolean {
    if (!this.currentUser || !this.post || !comment || !comment.user) return false;

    // Check if the current user is the comment author
    if (this.currentUser.id === comment.user.id) {
      return true;
    }

    // Check if the current user is the post author
    if (this.post.user && this.currentUser.id === this.post.user.id) {
      return true;
    }

    // Check if the current user is an admin
    if (this.currentUser.role === 'ADMIN') {
      return true;
    }

    return false;
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        console.log('Comment deleted successfully');
        // Remove the deleted comment from the local list
        if (this.post?.comments) {
          this.post.comments = this.post.comments.filter(c => c.id !== commentId);
        }
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    });
  }

  startEditingComment(comment: Comment): void {
    if (!this.canEditComment(comment)) {
      return;
    }
    this.editingCommentId = comment.id!;
    this.editedCommentText = comment.text || '';
    this.editedCommentImageUrl = comment.pictureUrl || '';
  }

  cancelEditingComment(): void {
    this.editingCommentId = null;
    this.editedCommentText = '';
    this.editedCommentImageUrl = '';
    this.isSubmittingCommentEdit = false;
  }

  saveCommentChanges(commentId: number): void {
    if (!this.editedCommentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    this.isSubmittingCommentEdit = true;

    const updatedComment: Partial<Comment> = {
      id: commentId,
      text: this.editedCommentText,
      pictureUrl: this.editedCommentImageUrl || '',
    };

    this.commentService.updateComment(commentId, updatedComment).subscribe({
      next: (comment: Comment) => {
        console.log('Comment updated successfully', comment);
        // Find the updated comment in the local list and replace it
        const index = this.post?.comments?.findIndex(c => c.id === comment.id);
        if (this.post?.comments && index !== undefined && index !== -1) {
          this.post.comments[index] = comment;
        }
        this.cancelEditingComment(); // Exit edit mode
      },
      error: (error: any) => {
        console.error('Error updating comment:', error);
        alert('Failed to update comment. Please try again.');
        this.isSubmittingCommentEdit = false;
      }
    });
  }

  canEditComment(comment: Comment): boolean {
    if (!this.currentUser || !comment || !comment.user) return false;

    // Check if the current user is the comment author or admin
    if (this.currentUser.id === comment.user.id || this.currentUser.role === 'ADMIN') {
      return true;
    }

    return false;
  }
}
