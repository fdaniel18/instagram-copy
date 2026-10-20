import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { PostService } from "../../../services/post.service"
import { AuthService } from "../../../services/auth.service"
import type { Post } from "../../../models/post.model"
import type { Tag } from "../../../models/tag.model"

@Component({
  selector: "app-create-post",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.scss"],
})
export class CreatePostComponent implements OnInit, OnChanges {
  @Input() tags: Tag[] = []
  @Input() isVisible = false
  @Output() postCreated = new EventEmitter<Post>()
  @Output() cancelled = new EventEmitter<void>()

  newPost: Partial<Post> = {
    title: "",
    text: "",
    pictureUrl: "",
  }
  selectedTags: number[] = []
  isSubmitting = false
  error = ""
  randomTags: Tag[] = []
  isLoading = true

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true
    console.log('CreatePostComponent initialized with tags:', this.tags);
    this.selectRandomTags()
    this.isLoading = false
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tags']) {
      this.isLoading = true
      console.log('Tags changed:', changes['tags'].currentValue);
      this.selectRandomTags()
      this.isLoading = false
    }
  }

  selectRandomTags() {
    console.log('Selecting random tags from:', this.tags);
    // Shuffle the tags array and take first 8
    this.randomTags = [...this.tags]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
    console.log('Selected random tags:', this.randomTags);
  }

  submitPost(): void {
    if (!this.newPost.title?.trim() || !this.newPost.text?.trim()) {
      this.error = "Title and content are required"
      return
    }

    this.isSubmitting = true
    this.error = ""

    const postToCreate = {
      title: this.newPost.title,
      text: this.newPost.text,
      pictureUrl: this.newPost.pictureUrl || "",
      dateTime: new Date(),
      status: "Just_Posted" as const,
      stopComments: false,
      user: {
        id: this.authService.currentUserValue?.id
      },
      postTags: this.selectedTags.map(tagId => ({
        tag: { id: tagId }
      }))
    }

    this.postService.createPost(postToCreate as Post).subscribe({
      next: (createdPost) => {
        this.postCreated.emit(createdPost)
        this.resetForm()
        this.isSubmitting = false
        // Reload the page after successful post creation
        window.location.reload()
      },
      error: (error) => {
        console.error("Error creating post:", error)
        this.error = `Failed to create post: ${error.message}`
        this.isSubmitting = false
      },
    })
  }

  toggleTag(tagId: number): void {
    const index = this.selectedTags.indexOf(tagId)
    if (index === -1) {
      this.selectedTags.push(tagId)
    } else {
      this.selectedTags.splice(index, 1)
    }
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTags.includes(tagId)
  }

  resetForm(): void {
    this.newPost = {
      title: "",
      text: "",
      pictureUrl: "",
    }
    this.selectedTags = []
    this.error = ""
    this.selectRandomTags()
  }

  cancel(): void {
    this.resetForm()
    this.cancelled.emit()
  }
}
