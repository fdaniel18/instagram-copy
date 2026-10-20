import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import type { User } from "../../models/user.model"
import type { Post } from "../../models/post.model"
import { HeaderComponent } from "../header/header.component"
import { UserService } from "../../services/user.service"
import { PostService } from "../../services/post.service"
import { CommentService } from "../../services/comment.service"
import { finalize } from "rxjs/operators"
import { Router } from "@angular/router"

interface AdminUserView extends User {
  postCount?: number;
  commentCount?: number;
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUserView[] = []
  posts: Post[] = []
  userSearchTerm = ""
  postSearchTerm = ""
  isEditingUser = false
  isEditingPost = false
  editedUser: Partial<User> = {}
  editedPost: Post = {
    id: 0,
    title: "",
    text: "",
    pictureUrl: "",
    dateTime: new Date(),
    stopComments: false,
    status: "Just_Posted",
    user: {} as User,
    comments: [],
    votes: [],
    postTags: []
  }
  loading = {
    users: false,
    posts: false,
  }
  error = {
    users: "",
    posts: "",
  }

  constructor(
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers()
    this.loadPosts()
  }

  private loadUsers(): void {
    this.loading.users = true
    this.error.users = ""

    this.userService
      .getUsers()
      .pipe(finalize(() => (this.loading.users = false)))
      .subscribe({
        next: (users: User[]) => {
          this.users = users.map(user => ({ ...user, postCount: 0, commentCount: 0 } as AdminUserView));

          // Fetch post and comment counts for each user
          this.users.forEach(user => {
            if (user.id) {
              this.userService.getUserPostCount(user.id).subscribe(count => {
                user.postCount = count;
              });
              this.userService.getUserCommentCount(user.id).subscribe(count => {
                user.commentCount = count;
              });
            }
          });
        },
        error: (error) => {
          console.error("Error loading users:", error)
          this.error.users = `Failed to load users: ${error.message}`
        },
      })
  }

  private loadPosts(): void {
    this.loading.posts = true
    this.error.posts = ""

    this.postService
      .getPosts()
      .pipe(finalize(() => (this.loading.posts = false)))
      .subscribe({
        next: (posts) => {
          this.posts = posts
        },
        error: (error) => {
          console.error("Error loading posts:", error)
          this.error.posts = `Failed to load posts: ${error.message}`
        },
      })
  }

  get filteredUsers(): User[] {
    return this.users.filter(
      (user) =>
        user.username.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase()),
    )
  }

  get filteredPosts(): Post[] {
    return this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(this.postSearchTerm.toLowerCase()) ||
        post.text.toLowerCase().includes(this.postSearchTerm.toLowerCase()),
    )
  }

  editUser(user: User): void {
    this.editedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
    } as Partial<User>
    this.isEditingUser = true
  }

  cancelUserEdit(): void {
    this.isEditingUser = false
    this.editedUser = {
      id: 0,
      username: "",
      email: "",
      phone_number: "",
      role: "USER",
      isBanned: false,
      score: 0,
      posts: [],
      comments: [],
      votes: [],
    }
  }

  saveUserChanges(): void {
    this.userService.updateUser(this.editedUser as User).subscribe({
      next: (updatedUser: User) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser };

          if (updatedUser.id) {
            this.userService.getUserPostCount(updatedUser.id).subscribe(count => {
              this.users[index].postCount = count;
            });
            this.userService.getUserCommentCount(updatedUser.id).subscribe(count => {
              this.users[index].commentCount = count;
            });
          }
        }
        this.cancelUserEdit();
      },
      error: (error) => {
        console.error("Error updating user:", error)
        alert(`Failed to update user: ${error.message}`)
      },
    })
  }

  toggleUserBan(user: User): void {
    const newBanStatus = !user.isBanned;

    this.userService.toggleUserBan(user.id, newBanStatus).subscribe({
      next: (updatedUser: User) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser };

          if (updatedUser.id) {
            this.userService.getUserPostCount(updatedUser.id).subscribe(count => {
              this.users[index].postCount = count;
            });
            this.userService.getUserCommentCount(updatedUser.id).subscribe(count => {
              this.users[index].commentCount = count;
            });
          }
        }
      },
      error: (error) => {
        console.error("Error toggling user ban status:", error);
        alert(`Failed to ${newBanStatus ? "ban" : "unban"} user: ${error.message}`);
      },
    });
  }

  changeUserRole(user: User): void {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    this.userService.changeUserRole(user.id, newRole).subscribe({
      next: (updatedUser: User) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser };

          if (updatedUser.id) {
            this.userService.getUserPostCount(updatedUser.id).subscribe(count => {
              this.users[index].postCount = count;
            });
            this.userService.getUserCommentCount(updatedUser.id).subscribe(count => {
              this.users[index].commentCount = count;
            });
          }
        }
      },
      error: (error) => {
        console.error("Error changing user role:", error)
        alert(`Failed to change user role: ${error.message}`)
      },
    })
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id)
        },
        error: (error) => {
          console.error("Error deleting user:", error)
          alert(`Failed to delete user: ${error.message}`)
        },
      })
    }
  }

  editPost(post: Post): void {
    this.editedPost = {
      id: post.id,
      title: post.title,
      text: post.text,
      pictureUrl: post.pictureUrl,
      user: post.user,
      dateTime: post.dateTime,
      stopComments: post.stopComments,
      status: post.status,
      comments: post.comments,
      votes: post.votes,
      postTags: post.postTags
    }
    this.isEditingPost = true
  }

  cancelPostEdit(): void {
    this.isEditingPost = false
    this.editedPost = {
      id: 0,
      title: "",
      text: "",
      pictureUrl: "",
      dateTime: new Date(),
      stopComments: false,
      status: "Just_Posted",
      user: {} as User,
      comments: [],
      votes: [],
      postTags: []
    }
  }

  savePostChanges(): void {
    this.postService.updatePost(this.editedPost).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex((p) => p.id === updatedPost.id)
        if (index !== -1) {
          this.posts[index] = updatedPost
        }
        this.cancelPostEdit()
      },
      error: (error) => {
        console.error("Error updating post:", error)
        alert(`Failed to update post: ${error.message}`)
      },
    })
  }

  deletePost(post: Post): void {
    if (confirm(`Are you sure you want to delete post "${post.title}"?`)) {
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.posts = this.posts.filter((p) => p.id !== post.id)
        },
        error: (error) => {
          console.error("Error deleting post:", error)
          alert(`Failed to delete post: ${error.message}`)
        },
      })
    }
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains("modal-overlay")) {
      if (this.isEditingUser) {
        this.cancelUserEdit()
      } else if (this.isEditingPost) {
        this.cancelPostEdit()
      }
    }
  }

  viewPostDetails(postId: number): void {
    this.router.navigate(['/posts', postId]);
  }
}