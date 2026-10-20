import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  searchTerm: string = '';
  isEditingProfile: boolean = false;
  isEditingPost: boolean = false;
  editedUser: Partial<User> = {};
  editedPost: Partial<Post> = {};
  userPosts: Post[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    console.log('ProfileComponent - ngOnInit: currentUser', this.currentUser);
    if (this.currentUser) {
      this.loadUserPosts(this.currentUser.username);
    } else {
      // Redirect to login or handle not logged in state
      this.router.navigate(['/login']); // Example redirect
    }
  }

  loadUserPosts(username: string): void {
    this.postService.getPostsByUser(username).subscribe({
      next: (posts: Post[]) => {
        this.userPosts = posts;
      },
      error: (error: any) => {
        console.error('Error loading user posts:', error);
        // Handle error (e.g., display a message)
      }
    });
  }

  viewPostDetails(postId: number | undefined): void {
    if (postId) {
      this.router.navigate(['/posts', postId]);
    }
  }

  get filteredPosts(): Post[] {
    if (!this.userPosts) return [];
    return this.userPosts.filter(post =>
      post.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      post.text?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  startEditingProfile(): void {
    if (this.currentUser) {
      this.editedUser = { ...this.currentUser };
      this.isEditingProfile = true;
    }
  }

  cancelProfileEdit(): void {
    this.isEditingProfile = false;
    this.editedUser = {};
  }

  saveProfileChanges(): void {
    if (!this.editedUser.username || !this.editedUser.email) {
      alert('Username and Email are required.');
      return;
    }

    // Assuming an update user method exists in UserService
    this.userService.updateUser(this.editedUser as User).subscribe({
      next: (updatedUser: User) => {
        this.currentUser = updatedUser;
        // Check if authService has a method to update current user, otherwise handle accordingly
        if (this.authService.updateCurrentUser) {
           this.authService.updateCurrentUser(updatedUser); // Update user in auth service
        }
        this.isEditingProfile = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert(`Failed to update profile: ${error.message}`);
      }
    });
  }

  startEditingPost(post: Post): void {
    this.editedPost = { ...post };
    this.isEditingPost = true;
  }

  cancelPostEdit(): void {
    this.isEditingPost = false;
    this.editedPost = {};
  }

  savePostChanges(): void {
    if (!this.editedPost.title || !this.editedPost.text) {
      alert('Post title and content are required.');
      return;
    }

    // Assuming an update post method exists in PostService
    this.postService.updatePost(this.editedPost as Post).subscribe({
      next: (updatedPost) => {
        // Find the updated post in the local list and replace it
        const index = this.userPosts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          this.userPosts[index] = updatedPost;
        }
        this.cancelPostEdit();
        alert('Post updated successfully!');
      },
      error: (error) => {
        console.error('Error updating post:', error);
        alert(`Failed to update post: ${error.message}`);
      }
    });
  }

  deletePost(post: Post): void {
    if (confirm('Are you sure you want to delete this post?')) {
      // Assuming a delete post method exists in PostService
      this.postService.deletePost(post.id!).subscribe({
        next: () => {
          console.log('Post deleted successfully');
          // Remove the deleted post from the local list
          this.userPosts = this.userPosts.filter(p => p.id !== post.id);
          alert('Post deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert(`Failed to delete post: ${error.message}`);
        }
      });
    }
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      if (this.isEditingProfile) {
        this.cancelProfileEdit();
      } else if (this.isEditingPost) {
        this.cancelPostEdit();
      }
    }
  }
} 